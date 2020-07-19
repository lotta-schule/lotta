defmodule ApiWeb.Auth.AccessToken do
  @moduledoc """
  Guardian callbacks for Authorization
  """

  use Guardian,
    otp_app: :api,
    token_ttl: %{
      "access" => {20, :minutes},
      "refresh" => {3, :weeks},
      "high_security" => {5, :minutes}
    }

  alias Api.Accounts
  alias Api.Accounts.User

  @spec subject_for_token(%User{}, Map.t()) :: {:ok, String.t()} | {:error, :token_not_valid}
  def subject_for_token(%{id: user_id}, _claims) do
    {:ok, to_string(user_id)}
  end

  def subject_for_token(_payload, _claims), do: {:error, :token_not_valid}

  @spec resource_from_claims(Map.t()) :: {:ok, %User{}} | {:error, :user_not_found}
  def resource_from_claims(%{"sub" => subject_id}) do
    try do
      {:ok, Accounts.get_user!(subject_id)}
    rescue
      Ecto.NoResultsError ->
        {:error, :user_not_found}
    end
  end
end
