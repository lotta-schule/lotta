defmodule Lotta.Eduplaces.ClientCredentialStrategy do
  @moduledoc """
  OAuth2 strategy for Eduplaces login
  """
  use OAuth2.Strategy

  @spec config() :: Keyword.t()
  defp config(), do: Application.get_env(:lotta, Eduplaces)

  def client do
    client =
      OAuth2.Client.new(
        strategy: Lotta.Eduplaces.ClientCredentialStrategy,
        client_id: Keyword.fetch!(config(), :client_id),
        client_secret: Keyword.fetch!(config(), :client_secret),
        site: Keyword.fetch!(config(), :api_url) <> "/idm/ep/v1",
        token_url: Keyword.fetch!(config(), :token_url)
      )

    token = fetch_token!(client)

    Map.put(client, :token, token)
  end

  defp scope,
    do: [
      "urn:eduplaces:idm:v1:schools:read",
      "urn:eduplaces:idm:v1:groups:read",
      "urn:eduplaces:idm:v1:users:read"
    ]

  defp fetch_token!(%OAuth2.Client{} = client) do
    Lotta.Tesla.create_client([
      {Tesla.Middleware.BaseUrl, client.token_url},
      Tesla.Middleware.FormUrlencoded,
      Tesla.Middleware.JSON,
      {Tesla.Middleware.BasicAuth, username: client.client_id, password: client.client_secret}
    ])
    |> Tesla.post("", %{
      grant_type: "client_credentials",
      scope: scope() |> Enum.join(" ")
    })
    |> then(fn
      {:ok, %Tesla.Env{status: 200, body: %{"access_token" => _} = token_map}} ->
        OAuth2.AccessToken.new(token_map)

      {:ok, %Tesla.Env{status: status, body: body}} ->
        raise "Failed to fetch token: #{status} - #{inspect(body)}"

      {:error, reason} ->
        raise "Error fetching token: #{inspect(reason)}"
    end)
  end

  # Strategy Callbacks

  def authorize_url(client, params),
    do: OAuth2.Strategy.ClientCredentials.authorize_url(client, params)

  def get_token(client \\ client(), _params, _headers) do
    Map.put(client, :token, fetch_token!(client))
  end
end
