defmodule Lotta.Eduplaces.IDM do
  @moduledoc """
  IDM client for Eduplaces. Get user information and schedule data.
  """

  @spec config() :: Keyword.t()
  defp config(), do: Application.get_env(:lotta, Eduplaces)

  @spec api_url() :: String.t()
  defp api_url(), do: Keyword.fetch!(config(), :api_url) <> "/idm/ep/v1"

  @spec scopes() :: [String.t()]
  defp scopes(),
    do:
      [
        "urn:eduplaces:idm:v1:schools:read",
        "urn:eduplaces:idm:v1:groups:read",
        "urn:eduplaces:idm:v1:people:read",
        "urn:eduplaces:idm:v1:users:read"
      ]
      |> Enum.join(" ")

  @spec create_http_client(access_token :: OAuth2.AccessToken.t()) :: Tesla.Client.t()
  def create_http_client(access_token) do
    middleware = [
      {Tesla.Middleware.BearerAuth, token: access_token.access_token},
      {Tesla.Middleware.BaseUrl, api_url()},
      Tesla.Middleware.JSON,
      Tesla.Middleware.Logger
    ]

    Lotta.Tesla.create_client(middleware)
  end

  @spec create_oauth_client() :: OAuth2.Client.t()
  def create_oauth_client() do
    OAuth2.Client.new(
      strategy: OAuth2.Strategy.ClientCredentials,
      client_id: Keyword.fetch!(config(), :client_id),
      client_secret: Keyword.fetch!(config(), :client_secret),
      site: Keyword.fetch!(config(), :auth_url),
      token_url: Keyword.fetch!(config(), :token_url)
    )
  end

  @doc """
  Fetch an access token using the provided authorization code.
  """
  @doc since: "6.1.0"
  @spec fetch_access_token(client :: OAuth2.Client.t()) ::
          {:ok, OAuth2.AccessToken.t()} | {:error, any()}
  def fetch_access_token(client), do: OAuth2.Client.get_token(client, scope: scopes())

  @doc """
  Get the current user's information.
  """
  @doc since: "6.1.0"
  @spec get_user_info(access_token :: OAuth2.AccessToken.t()) ::
          {:ok, map()} | {:error, any()}
  def get_user_info(access_token) do
    create_http_client(access_token)
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
