defmodule Api.Guardian do
  @moduledoc """
  Guardian callbacks for Authorization
  """

  use Guardian, otp_app: :api
  alias Api.Accounts

  def subject_for_token(user, _claims) do
    sub = to_string(user.id)
    {:ok, sub}
  end

  def resource_from_claims(claims) do
    try do
      {:ok, Accounts.get_user!(claims["sub"])}
    rescue
      Ecto.NoResultsError ->
        {:error, :user_not_found}

      _ ->
        {:error, :unexpected_error}
    end
  end
end
