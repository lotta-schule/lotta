defmodule Lotta.Accounts.Authentication do
  @moduledoc """
  Helper module for authentication purposes
  """

  import Ecto.Query

  alias LottaWeb.Auth.AccessToken
  alias Lotta.Repo
  alias Lotta.Tenants.Tenant
  alias Lotta.Accounts.User

  require Logger

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

  @spec login_with_username_pass(String.t(), String.t(), Tenant.t() | nil) ::
          {:ok, User.t()} | {:error, term()}

  def login_with_username_pass(username, given_pass, tenant \\ nil) do
    username = String.downcase(username)

    prefix = if tenant, do: tenant.prefix, else: Repo.get_prefix()

    user =
      Repo.one(
        from(u in User,
          where: fragment("lower(?)", u.email) == ^username
        ),
        prefix: prefix
      )

    if verify_user_pass(user, given_pass) do
      user
      |> maybe_migrate_password_hashing_format(given_pass)
    else
      {:error, "Falsche Zugangsdaten."}
    end
  end

  @doc """
  Validates a password for a given user.

  Returns true if the given password is valid, otherwise return false.
  """
  @doc since: "2.3.0"

  @spec verify_user_pass(User.t() | nil, String.t()) :: boolean()

  def verify_user_pass(user, password) do
    cond do
      is_nil(user) ->
        Logger.warning("User not found when trying to verify password.")
        false

      user.password_hash_format == 1 ->
        Argon2.verify_pass(password, user.password_hash)

      true ->
        Bcrypt.verify_pass(password, user.password_hash)
    end
  end

  @doc """
  Migrate the password to a newer format if one is in use

  Returns {:ok, user} if the operation was successfull, otherwise return {:error, error}
  """
  @doc since: "2.3.0"

  @spec maybe_migrate_password_hashing_format(User.t(), String.t()) ::
          {:ok, User.t()} | {:error, term()}

  def maybe_migrate_password_hashing_format(user, password) do
    # PW Hashing formats:
    # 0   :   BCrypt
    # 1   :   Argon2
    newest_password_hashing_format = 1

    if not is_nil(user.password_hash) and not is_nil(user.password_hash_format) and
         user.password_hash_format < newest_password_hashing_format do
      user
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_change(:password_hash, Argon2.hash_pwd_salt(password))
      |> Ecto.Changeset.put_change(:password_hash_format, 1)
      |> Repo.update()
    else
      {:ok, user}
    end
  end

  @doc """
  Generate a set of access and refresh token for a given user
  """
  @doc since: "2.0.0"

  @spec create_user_tokens(User.t(), keyword()) ::
          {:ok, access_token, refresh_token} | {:error, term()}
  def create_user_tokens(user, opts \\ []) do
    token_type = Keyword.get(opts, :token_type, "access")

    with {:ok, access_token, _claims} <-
           AccessToken.encode_and_sign(user, %{}, token_type: token_type),
         {:ok, refresh_token, _claims} <-
           AccessToken.encode_and_sign(user, %{}, token_type: "refresh") do
      {:ok, access_token, refresh_token}
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
end
