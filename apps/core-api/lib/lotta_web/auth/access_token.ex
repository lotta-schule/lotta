defmodule LottaWeb.Auth.AccessToken do
  @moduledoc """
  Guardian callbacks for Authorization
  """

  use Guardian,
    otp_app: :lotta,
    token_ttl: %{
      "access" => {60, :minutes},
      "refresh" => {4, :weeks},
      "hisec" => {5, :minutes}
    }

  require Logger

  alias Lotta.{Accounts, Repo, Tenants}
  alias Lotta.Accounts.User
  alias LottaWeb.Urls

  @spec subject_for_token(User.t(), map()) :: {:ok, String.t()} | {:error, :token_not_valid}
  def subject_for_token(%{id: user_id}, _claims) do
    {:ok, to_string(user_id)}
  end

  def subject_for_token(_payload, _claims), do: {:error, :token_not_valid}

  @spec resource_from_claims(map()) :: {:ok, User.t()} | {:error, :user_not_found}
  def resource_from_claims(%{"sub" => subject_id, "tid" => tid}) do
    tenant = Tenants.get_tenant(tid)

    cond do
      is_nil(tenant) ->
        {:error, :tenant_not_found}

      is_nil(Repo.get_prefix()) || Repo.get_prefix() != tenant.prefix ->
        {:error, :invalid_tenant}

      true ->
        user = Accounts.get_user(subject_id)
        if is_nil(user), do: {:error, :not_found}, else: {:ok, user}
    end
  end

  @doc """
  Given a user, returns the claims to be encoded into the token.
  Relevant informations that will be encoded into the token are:
  - email
  - wether the user is admin
  - all the user's groups' ids
  - the user's assigned groups' ids
  - the tenant for which the token is valid
  """
  @doc since: "1.0.0"

  @spec build_claims(Guardian.Token.claims(), User.t(), Guardian.options()) ::
          {:ok, map()} | {:error, atom()}

  def build_claims(claims, user, _options) do
    user = Repo.preload(user, [:groups])

    tenant =
      user
      |> Ecto.get_meta(:prefix)
      |> Tenants.get_tenant_by_prefix()

    all_groups =
      user.groups ++
        (user.enrollment_tokens
         |> Accounts.list_groups_for_enrollment_tokens(tenant))

    is_admin =
      all_groups
      |> Enum.any?(& &1.is_admin_group)

    host = Urls.get_tenant_host(tenant)

    claims =
      Map.merge(claims, %{
        email: user.email,
        aud: host,
        iss: host,
        tid: tenant.id,
        adm: is_admin,
        gps: Enum.map(all_groups, &%{id: to_string(&1.id)}),
        agp: Enum.map(user.groups, &%{id: to_string(&1.id)})
      })

    {:ok, claims}
  end

  @callback verify_claims(claims :: Guardian.Token.claims(), options :: keyword()) ::
              {:ok, Guardian.Token.claims()} | {:error, atom}
  def verify_claims(claims, opts) do
    if Keyword.has_key?(opts, :verify_type_one_of) do
      opts
      |> Keyword.fetch!(:verify_type_one_of)
      |> Enum.any?(&(Map.get(claims, "typ") == &1))
      |> case do
        true ->
          {:ok, claims}

        false ->
          Logger.error("Invalid token type: #{inspect(claims)}")
          {:error, :invalid_token}
      end
    else
      {:ok, claims}
    end
  end
end
