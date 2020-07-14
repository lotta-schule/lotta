defmodule ApiWeb.Auth.AccessToken do
  @moduledoc """
  Guardian callbacks for Authorization
  """

  use Guardian, otp_app: :api

  alias Api.Accounts

  def subject_for_token(%{id: user_id}, _claims) do
    {:ok, to_string(user_id)}
  end

  def subject_for_token(_payload, _claims), do: {:error, :token_not_valid}

  def resource_from_claims(%{"sub" => subject_id}) do
    try do
      {:ok, Accounts.get_user!(subject_id)}
    rescue
      Ecto.NoResultsError ->
        {:error, :user_not_found}
    end
  end
end
