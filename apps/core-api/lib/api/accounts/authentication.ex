defmodule Api.Accounts.Authentication do
  @moduledoc """
  Helper module for authentication purposes
  """

  import Bcrypt
  import Ecto.Query
  import Api.Accounts.Permissions

  alias ApiWeb.Auth.AccessToken
  alias Api.Repo
  alias Api.Accounts.User
  alias Api.Tenants.Tenant

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

  @spec create_user_tokens(%User{}, map()) ::
          {:ok, access_token, refresh_token} | {:error, term()}
  def create_user_tokens(user, claims \\ %{}) do
    with {:ok, access_token, _claims} <-
           AccessToken.encode_and_sign(user, claims, token_type: :access),
         {:ok, refresh_token, _claims} <-
           AccessToken.encode_and_sign(user, claims, token_type: :refresh) do
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
         {:ok, refresh_token, _claims} <- AccessToken.encode_and_sign(user) do
      {:ok, access_token, refresh_token}
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  generate token claims for a given user in dependence of an optionally given tenant
  """
  @doc since: "2.0.0"

  @spec get_claims_for_user(User.t(), Tenant.t() | nil) :: {:ok, map()} | {:error, term()}

  def get_claims_for_user(user, tenant \\ nil)

  def get_claims_for_user(user, tenant) when is_nil(tenant) do
    %{
      aud: "lotta",
      gps: Enum.map(User.get_groups(user), &%{id: to_string(&1.id), name: &1.name}),
      agp: Enum.map(User.get_assigned_groups(user), &%{id: to_string(&1.id), name: &1.name})
    }
  end

  def get_claims_for_user(user, tenant) do
    %{
      tid: tenant.id,
      aud: Tenant.get_lotta_url(tenant, skip_protocol: true),
      adm: user_is_admin?(user, tenant),
      sad: user_is_lotta_admin?(user),
      gps: Enum.map(User.get_groups(user, tenant), &%{id: to_string(&1.id)}),
      agp: Enum.map(User.get_assigned_groups(user, tenant), &%{id: to_string(&1.id)})
    }
  end

  @doc """
  Ensures a given user is not blocked for a given tenant.
  Returns `{:error, reason}` if the user is blocked for the tenant.
  Returns `:ok` if the user is fine.
  """
  @doc since: "2.0.0"

  @spec ensure_user_is_not_blocked(User.t(), Tenant.t()) :: :ok | {:error, term()}

  def ensure_user_is_not_blocked(%User{} = user, %Tenant{} = tenant) do
    if user_is_blocked?(user, tenant) do
      {:error, "Du wurdest geblockt. Du darfst dich nicht anmelden."}
    else
      :ok
    end
  end
end
