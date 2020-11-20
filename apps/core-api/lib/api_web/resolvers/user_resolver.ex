defmodule ApiWeb.UserResolver do
  @moduledoc """
  GraphQL Resolver Module for finding, updating and deleting users.
  Takes care of login and registration, as well as password recovery functionality.
  """

  require Logger

  import Api.Accounts.Authentication
  import Api.Accounts.Permissions
  import ApiWeb.ErrorHelpers

  alias Ecto.NoResultsError
  alias Api.Repo
  alias Api.Accounts
  alias Api.Accounts.User
  alias Api.Mailer

  def resolve_name(user, _args, %{context: %{current_user: current_user}}) do
    cond do
      current_user.id == user.id ->
        {:ok, user.name}

      user_is_admin?(current_user) ->
        {:ok, user.name}

      !user.hide_full_name ->
        {:ok, user.name}

      true ->
        {:ok, nil}
    end
  end

  def resolve_name(_user, _args, _info), do: {:ok, nil}

  def resolve_email(user, _args, %{context: %{current_user: current_user}}) do
    cond do
      current_user.id == user.id ->
        {:ok, user.email}

      user_is_admin?(current_user) ->
        {:ok, user.email}

      true ->
        {:error, "Die Email des Nutzers ist geheim."}
    end
  end

  def resolve_email(_user, _args, _info), do: {:error, "Die Email des Nutzers ist geheim."}

  def resolve_last_seen(user, _args, %{context: %{current_user: current_user}}) do
    cond do
      current_user.id == user.id ->
        {:ok, user.last_seen}

      user_is_admin?(current_user) ->
        {:ok, user.last_seen}

      true ->
        {:error, "Der Online-Status des Nutzers ist geheim."}
    end
  end

  def resolve_last_seen(_user, _args, _info),
    do: {:error, "Der Online-Status des Nutzers ist geheim."}

  def get_current(_args, %{context: %{current_user: current_user}}) do
    {:ok, current_user}
  end

  def get_current(_args, _info) do
    {:ok, nil}
  end

  def resolve_groups(user, _args, _info), do: {:ok, User.get_groups(user)}

  def resolve_assigned_groups(user, _args, _info) do
    {:ok, User.get_assigned_groups(user)}
  end

  def resolve_enrollment_tokens(user, _args, _info) do
    user = Repo.preload(user, :enrollment_tokens)

    tokens =
      user.enrollment_tokens
      |> Enum.map(& &1.enrollment_token)

    {:ok, tokens}
  end

  def all(_args, %{context: %{current_user: current_user}}) do
    if user_is_admin?(current_user) do
      {:ok, Accounts.list_users()}
    else
      {:error, "Nur Administrator dürfen auf Benutzer auflisten."}
    end
  end

  def all(_args, _info), do: {:error, "Nur Administrator dürfen auf Benutzer auflisten."}

  def search(%{searchtext: searchtext}, %{context: context}) do
    cond do
      !context[:current_user] || !user_is_admin?(context.current_user) ->
        {:error, "Nur Administrator dürfen auf Benutzer auflisten."}

      String.length(searchtext) >= 2 ->
        {:ok, Accounts.search_user(searchtext)}

      true ->
        {:ok, []}
    end
  end

  def get(%{id: id}, %{context: %{current_user: current_user}}) when not is_nil(current_user) do
    {:ok, Accounts.get_user(String.to_integer(id))}
  end

  def get(_args, _info), do: {:error, "Nur angemeldete Nutzer dürfen Nutzer abrufen."}

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
      {:error, reason} ->
        {:error,
         [
           message: "Registrierung fehlgeschlagen.",
           details: extract_error_details(reason)
         ]}
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

  def destroy_account(args, %{context: %{current_user: current_user}}) do
    transfer_file_ids = args[:transfer_file_ids] || []
    Accounts.transfer_files_by_ids(transfer_file_ids, current_user)
    Accounts.delete_user(current_user)
  end

  def destroy_account(_args, _info), do: {:error, "Du bist nicht angemeldet."}

  def update(%{id: id} = args, %{context: %{current_user: current_user}}) do
    if user_is_admin?(current_user) do
      case Accounts.get_user(String.to_integer(id)) do
        nil ->
          {:error, "Nutzer mit der id #{id} nicht gefunden."}

        user ->
          Accounts.update_user(user, args)
      end
    else
      {:error, "Nur Administratoren dürfen Benutzern Gruppen zuweisen."}
    end
  end

  def update_profile(%{user: user_params}, %{context: %{current_user: current_user}}) do
    case Accounts.update_profile(current_user, user_params) do
      {:ok, user} ->
        {:ok, user}

      {:error, error} ->
        {:error,
         [
           message: "Speichern fehlgeschlagen.",
           details: extract_error_details(error)
         ]}
    end
  end

  def update_profile(_args, _info), do: {:error, "Du bist nicht angemeldet."}

  def update_password(%{current_password: password, new_password: new_password}, %{
        context: %{current_user: %{email: email}}
      }) do
    with {:ok, user} <- login_with_username_pass(email, password),
         {:ok, user} <- Accounts.update_password(user, new_password) do
      {:ok, user}
    else
      {:error, message} when is_binary(message) ->
        {:error, message}

      {:error, error} ->
        {:error,
         [
           message: "Passwort ändern fehlgeschlagen.",
           details: extract_error_details(error)
         ]}
    end
  end
end
