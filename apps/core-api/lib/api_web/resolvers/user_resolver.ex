defmodule ApiWeb.UserResolver do
  @moduledoc false

  require Logger

  import Api.Accounts.Authentication
  import ApiWeb.ErrorHelpers

  alias ApiWeb.Context
  alias Api.Repo
  alias Api.Accounts
  alias Api.Mailer

  def resolve_name(user, _args, %{context: %Context{current_user: current_user}}) do
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

  def get_current(_args, %{context: %Context{current_user: current_user}}) do
    {:ok, current_user}
  end

  def resolve_groups(user, _args, _info) do
    {:ok,
     user.groups ++
       (user
        |> Repo.preload(:enrollment_tokens)
        |> Map.fetch!(:enrollment_tokens)
        |> Enum.map(& &1.enrollment_token)
        |> Accounts.list_groups_for_enrollment_tokens())}
  end

  def resolve_assigned_groups(user, _args, _info) do
    {:ok, Map.fetch!(user, :groups)}
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

  def register(%{user: user_params} = args, _info) do
    user_params =
      user_params
      |> Map.put(
        :enrollment_tokens,
        case args do
          %{group_key: group_key} -> [group_key]
          _ -> []
        end
      )

    with {:ok, user} <- Accounts.register_user(user_params),
         {:ok, access_token, refresh_token} <- create_user_tokens(user) do
      Api.Email.registration_mail(user)
      |> Mailer.deliver_now()

      {:ok, %{user: user, access_token: access_token, refresh_token: refresh_token}}
    else
      res ->
        format_errors(res, "Registrierung fehlgeschlagen.")
    end
  end

  def login(%{username: username, password: password}, _info) do
    with {:ok, user} <- login_with_username_pass(username, password),
         :ok <- ensure_user_is_not_blocked(user),
         {:ok, access_token, refresh_token} <- create_user_tokens(user) do
      {:ok, %{user: user, access_token: access_token, refresh_token: refresh_token}}
    else
      {:error, reason} ->
        {:error, reason}
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

  def destroy_account(args, %{context: %Context{current_user: current_user}}) do
    transfer_file_ids = args[:transfer_file_ids] || []
    Accounts.transfer_files_by_ids(transfer_file_ids, current_user)
    Accounts.delete_user(current_user)
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

  def update_password(%{current_password: password, new_password: new_password}, %{
        context: %Context{current_user: %{email: email}}
      }) do
    with {:ok, user} <- login_with_username_pass(email, password),
         {:ok, user} <- Accounts.update_password(user, new_password) do
      {:ok, user}
    else
      res ->
        format_errors(res, "Passwort ändern fehlgeschlagen.")
    end
  end
end
