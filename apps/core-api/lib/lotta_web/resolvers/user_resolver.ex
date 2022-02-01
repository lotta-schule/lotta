defmodule LottaWeb.UserResolver do
  @moduledoc false

  require Logger

  import Lotta.Accounts.Authentication
  import LottaWeb.ErrorHelpers

  alias LottaWeb.Context
  alias LottaWeb.Auth.AccessToken
  alias Lotta.Accounts.User
  alias Lotta.{Accounts, Repo, Mailer, Messages, Storage}

  def resolve_name(%User{} = user, _args, %{context: %Context{current_user: current_user}})
      when not is_nil(current_user) do
    cond do
      current_user.id == user.id ->
        {:ok, user.name}

      current_user.is_admin? ->
        {:ok, user.name}

      !user.hide_full_name ->
        {:ok, user.name}

      true ->
        {:ok, nil}
    end
  end

  def resolve_name(_user, _args, _info), do: {:ok, nil}

  def resolve_email(user, _args, %{context: %Context{current_user: current_user}}) do
    cond do
      current_user.id == user.id ->
        {:ok, user.email}

      current_user.is_admin? ->
        {:ok, user.email}

      true ->
        {:error, "Die Email des Nutzers ist geheim."}
    end
  end

  def resolve_email(_user, _args, _info), do: {:error, "Die Email des Nutzers ist geheim."}

  def resolve_last_seen(user, _args, %{context: %Context{current_user: current_user}}) do
    cond do
      current_user.id == user.id ->
        {:ok, user.last_seen}

      current_user.is_admin? ->
        {:ok, user.last_seen}

      true ->
        {:error, "Der Online-Status des Nutzers ist geheim."}
    end
  end

  def resolve_last_seen(_user, _args, _info),
    do: {:error, "Der Online-Status des Nutzers ist geheim."}

  def resolve_unread_messages(user, _args, %{context: %Context{current_user: current_user}})
      when user.id == current_user.id do
    {:ok, Messages.count_unread_messages(user)}
  end

  def resolve_unread_messages(_user, _args, _info),
    do: {:error, "Die Nachrichten des Nutzers sind geheim."}

  def get_current(_args, %{context: %Context{current_user: current_user}}) do
    Accounts.see_user(current_user)
    {:ok, current_user}
  end

  def resolve_groups(user, _args, %{context: %{tenant: _t}}) do
    user = Repo.preload(user, [:groups, :enrollment_tokens])

    {:ok,
     user.groups ++
       (user.enrollment_tokens
        |> Enum.map(& &1.enrollment_token)
        |> Accounts.list_groups_for_enrollment_tokens())}
  end

  def resolve_assigned_groups(user, _args, _info) do
    user = Repo.preload(user, :groups)

    {:ok, user.groups}
  end

  def resolve_enrollment_tokens(user, _args, %{context: %Context{current_user: current_user}}) do
    tokens =
      if user.id == current_user.id do
        user = Repo.preload(user, :enrollment_tokens)

        user.enrollment_tokens
        |> Enum.map(& &1.enrollment_token)
      else
        []
      end

    {:ok, tokens}
  end

  def all(_args, _info) do
    {:ok, Accounts.list_users()}
  end

  def search(%{searchtext: searchtext}, _info) when bit_size(searchtext) >= 16 do
    {:ok, Accounts.search_user(searchtext)}
  end

  def search(_args, _info), do: {:ok, []}

  def get(%{id: id}, _info) do
    {:ok, Accounts.get_user(String.to_integer(id))}
  end

  def register(%{user: user_params} = args, %{context: %{tenant: tenant}}) do
    user_params =
      user_params
      |> Map.put(
        :enrollment_tokens,
        case args do
          %{group_key: group_key} -> [group_key]
          _ -> []
        end
      )

    case Accounts.register_user(tenant, user_params) do
      {:ok, user, password} ->
        user
        |> Lotta.Email.registration_mail(password)
        |> Mailer.deliver_now()

        {:ok, true}

      res ->
        format_errors(res, "Registrierung fehlgeschlagen.")
    end
  end

  def login(%{username: username, password: password}, _info) do
    with {:ok, user} <- login_with_username_pass(username, password),
         {:ok, access_token, refresh_token} <- create_user_tokens(user) do
      {:ok, %{user: user, access_token: access_token, refresh_token: refresh_token}}
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  def request_hisec_token(%{password: password}, %{context: %Context{current_user: current_user}}) do
    with true <- verify_user_pass(current_user, password),
         {:ok, hisec_token, _claims} <-
           AccessToken.encode_and_sign(current_user, %{}, token_type: "hisec") do
      {:ok, hisec_token}
    else
      false ->
        {:error, "Falsche Zugangsdaten."}

      error ->
        error
    end
  end

  def logout(_args, _info) do
    {:ok, %{sign_out_user: true}}
  end

  def request_password_reset(%{email: email}, _info) do
    case Accounts.request_password_reset(email) do
      {:ok, user} ->
        Logger.info("user request password request - send mail to #{user.email}")

      error ->
        Sentry.capture_message(inspect(error), extra: %{email: email})
    end

    {:ok, true}
  end

  def reset_password(%{email: email, token: token, password: password}, _info) do
    with {:ok, user} <- Accounts.find_user_by_reset_token(email, token),
         {:ok, user} <- Accounts.update_password(user, password),
         {:ok, access_token, refresh_token} <- create_user_tokens(user) do
      {:ok, %{user: user, access_token: access_token, refresh_token: refresh_token}}
    else
      error ->
        if error do
          Logger.warn(inspect(error))
        end

        {:error, "Die Seite ist nicht mehr gültig. Starte den Vorgang erneut."}
    end
  end

  def destroy_account(%{user_id: user_id} = args, %{context: %Context{current_user: current_user}}) do
    if user_id != to_string(current_user.id) && !current_user.is_admin? do
      {:error, "Du darfst das nicht tun."}
    else
      user_to_delete = Accounts.get_user(String.to_integer(user_id))

      (args[:transfer_file_ids] || [])
      |> Storage.archive_user_files_by_ids(user_to_delete)

      Accounts.delete_user(user_to_delete)
    end
  end

  def update(%{id: id} = args, _info) do
    user = Accounts.get_user(String.to_integer(id))

    if is_nil(user) do
      {:error, "Nutzer mit der id #{id} nicht gefunden."}
    else
      user
      |> Accounts.update_user(args)
      |> format_errors("Fehler beim Bearbeiten des Nutzers.")
    end
  end

  def update_profile(%{user: user_params}, %{context: %Context{current_user: current_user}}) do
    current_user
    |> Accounts.update_profile(user_params)
    |> format_errors("Speichern fehlgeschlagen.")
  end

  def update_password(%{new_password: new_password}, %{
        context: %Context{current_user: user}
      }) do
    user
    |> Accounts.update_password(new_password)
    |> format_errors("Passwort ändern fehlgeschlagen.")
  end

  def update_email(%{new_email: new_email}, %{
        context: %Context{current_user: user}
      }) do
    user
    |> Accounts.update_email(new_email)
    |> format_errors("Email ändern fehlgeschlagen.")
  end
end
