defmodule Lotta.Eduplaces.IDM do
  @moduledoc """
  IDM client for Eduplaces. Get user information and schedule data.
  """

  @spec config() :: Keyword.t()
  defp config(), do: Application.get_env(:lotta, Eduplaces)

  @spec api_url() :: String.t()
  defp api_url(), do: Keyword.fetch!(config(), :api_url) <> "/idm/ep/v1"

  @spec client(access_token :: OAuth2.AccessToken.t()) :: Tesla.Client.t()
  defp client(access_token) do
    middleware = [
      {Tesla.Middleware.BearerAuth, token: access_token.access_token},
      {Tesla.Middleware.BaseUrl, api_url()},
      Tesla.Middleware.JSON,
      Tesla.Middleware.Logger
    ]

    Lotta.Tesla.create_client(middleware)
  end

  @doc """
  Get the current user's information.
  """
  @doc since: "6.1.0"
  @spec get_user_info(access_token :: OAuth2.AccessToken.t()) ::
          {:ok, map()} | {:error, any()}
  def get_user_info(access_token) do
    client(access_token)
    |> Tesla.get("/users/:id")
    |> case do
      {:ok, %Tesla.Env{status: 200, body: body}} ->
        {:ok, body}

      {:ok, %Tesla.Env{status: status, body: body}} ->
        {:error, %{status: status, body: body}}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
