defmodule Api.Accounts.Authentication do
  @moduledoc """
  Helper module for authentication purposes
  """

  import Bcrypt
  import Ecto.Query

  alias ApiWeb.Auth.AccessToken
  alias Api.Repo
  alias Api.Accounts.User

  @typedoc """
  A token representing a user.
  """
  @type access_token :: String.t()

  @typedoc """
  A refresh token is a token which can be exchanged with an access token.
  As a refresh token has a long validity and stays valid until user logs out, it should be kept very private.
  """
  @type refresh_token :: String.t()

  @doc """
  Validates a password for a user found by a given email, if it exists.

  If the user is found and the password is valid, returns `{:ok, user}`. If not, returns `{:error, reason}`
  """
  @doc since: "1.0.0"

  @spec login_with_username_pass(String.t(), String.t()) :: {:ok, User.t()} | {:error, term()}

  def login_with_username_pass(username, given_pass) do
    username = String.downcase(username)

    user =
      Repo.one(
        from u in User,
          where: fragment("lower(?)", u.email) == ^username
      )

    if user && verify_pass(given_pass, user.password_hash) do
      {:ok, user}
    else
      {:error, "Falsche Zugangsdaten."}
    end
  end

  @doc """
  Generate a set of access and refresh token for a given user
  """
  @doc since: "2.0.0"

  @spec create_user_tokens(User.t()) :: {:ok, access_token, refresh_token} | {:error, term()}
  def create_user_tokens(user) do
    with {:ok, access_token, _claims} <-
           AccessToken.encode_and_sign(user, %{}, token_type: "access"),
         {:ok, refresh_token, _claims} <-
           AccessToken.encode_and_sign(user, %{}, token_type: "refresh") do
      {:ok, access_token, refresh_token}
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Generate new access and refresh tokens for a user for a given valid refresh token
  """
  @doc since: "2.0.0"

  @spec refresh_token(refresh_token) :: {:ok, access_token, refresh_token} | {:error, term()}

  def refresh_token(token) do
    with {:ok, _old_data, {access_token, _claims}} <-
           AccessToken.exchange(token, "refresh", "access"),
         {:ok, user, _claims} <- AccessToken.resource_from_token(access_token),
         {:ok, refresh_token, _claims} <-
           AccessToken.encode_and_sign(user, %{}, token_type: "refresh") do
      {:ok, access_token, refresh_token}
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Ensures a given user is not blocked for a given.
  Returns `{:error, reason}` if the user is blocked.
  Returns `:ok` if the user is fine.
  """
  @doc since: "2.0.0"

  @spec ensure_user_is_not_blocked(User.t()) :: :ok | {:error, term()}

  def ensure_user_is_not_blocked(%User{} = user) do
    case user.is_blocked do
      true -> {:error, "Du wurdest geblockt. Du darfst dich nicht anmelden."}
      false -> :ok
    end
  end
end
