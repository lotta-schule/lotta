defmodule ApiWeb.Auth.AccessToken do
  @moduledoc """
  Guardian callbacks for Authorization
  """

  use Guardian,
    otp_app: :api,
    token_ttl: %{
      "access" => {20, :minutes},
      "refresh" => {3, :weeks},
      "hisec" => {2, :minutes}
    }

  alias Api.Accounts
  alias Api.Accounts.User
  alias Api.Repo
  alias Api.System

  @spec subject_for_token(%User{}, Map.t()) :: {:ok, String.t()} | {:error, :token_not_valid}
  def subject_for_token(%{id: user_id}, _claims) do
    {:ok, to_string(user_id)}
  end

  def subject_for_token(_payload, _claims), do: {:error, :token_not_valid}

  @spec resource_from_claims(Map.t()) :: {:ok, %User{}} | {:error, :user_not_found}
  def resource_from_claims(%{"sub" => subject_id}) do
    try do
      {:ok, Accounts.get_user(subject_id)}
    rescue
      Ecto.NoResultsError ->
        {:error, :user_not_found}
    end
  end

  @doc """
  Given a user, returns the claims to be encoded into the token.
  Relevant informations that will be encoded into the token are:
  - email
  - wether the user is admin
  - all the user's groups' ids
  - the user's assigned groups' ids
  """
  @doc since: "1.0.0"

  @spec build_claims(Guardian.Token.claims(), User.t(), Guardian.options()) ::
          {:ok, map()} | {:error, atom()}

  def build_claims(claims, user, _options) do
    user =
      user
      |> Repo.preload([:groups, :enrollment_tokens])

    all_groups =
      user.groups ++
        (user.enrollment_tokens
         |> Enum.map(& &1.enrollment_token)
         |> Accounts.list_groups_for_enrollment_tokens())

    is_admin =
      all_groups
      |> Enum.any?(& &1.is_admin_group)

    claims =
      Map.merge(claims, %{
        email: user.email,
        aud: System.get_main_url(skip_protocol: true),
        iss: System.get_main_url(skip_protocol: true),
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
          {:error, :invalid_token}
      end
    else
      {:ok, claims}
    end
  end
end
