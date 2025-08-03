defmodule Lotta.Eduplaces.OAuthStrategy do
  @moduledoc """
  OAuth2 strategy for Eduplaces login
  """
  use OAuth2.Strategy

  alias JOSE.JWT
  alias Lotta.Eduplaces.UserInfo

  defp config do
    Application.get_env(:lotta, Eduplaces)
    |> Keyword.merge(
      strategy: __MODULE__
      # site: "https://api.github.com",
      # authorize_url: "https://github.com/login/oauth/authorize",
      # token_url: "https://github.com/login/oauth/access_token"
    )
  end

  def allowed_atoms do
    [
      :client_id,
      :client_secret,
      :site,
      :state,
      :response_type,
      :scope,
      :error,
      :error_description
    ]
  end

  def client do
    config()
    |> OAuth2.Client.new()
    # |> put_header("User-Agent", "Bond, James Bond")
    |> OAuth2.Client.put_serializer("application/json", Jason)
  end

  defp scope,
    do: [
      "openid",
      "role",
      "pseudonym",
      "groups",
      "school",
      "schooling_level",
      "school_name",
      "school_official_id"
    ]

  def authorize_url!(params \\ []) do
    scope_str = scope() |> Enum.join(" ")
    scope_str_wwwenc = URI.encode_www_form(scope_str)

    client()
    |> OAuth2.Client.authorize_url!(Keyword.merge(params, scope: scope_str))
    |> String.replace(scope_str_wwwenc, scope_str |> URI.encode())
  end

  def get_token!(params \\ [], headers \\ [], opts \\ []) do
    client()
    |> get_token!(params, headers, opts)
    |> Map.get(:token)
    |> then(&{&1, read_id_token(&1)})
  end

  # Strategy Callbacks

  def authorize_url(client, params) do
    OAuth2.Strategy.AuthCode.authorize_url(client, params)
  end

  def get_token(client, params \\ [], headers \\ []) do
    client
    |> put_header("accept", "application/json")
    |> OAuth2.Strategy.AuthCode.get_token(as_keyword_list(params), headers)
  end

  def read_id_token(%{other_params: %{"id_token" => id_token}}) do
    UserInfo.from_jwt_info(JWT.peek(id_token).fields)
  end

  defp as_keyword_list(map), do: Enum.map(map, fn {k, v} -> {String.to_existing_atom(k), v} end)
end
