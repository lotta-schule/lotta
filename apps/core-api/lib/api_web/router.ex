defmodule ApiWeb.Router do
  @moduledoc """
  Phoenix router
  """

  use ApiWeb, :router
  import Plug.BasicAuth
  import Phoenix.LiveDashboard.Router

  if Application.get_env(:honeybadger, :api_key) do
    use Honeybadger.Plug
  end

  pipeline :auth do
    plug ApiWeb.Auth.Pipeline
    plug ApiWeb.Context
  end

  pipeline :admin do
    plug :basic_auth, Application.fetch_env!(:api, :live_view)
  end

  pipeline :json_api do
    plug :accepts, ~w(json)
  end

  scope "/" do
    # add normal Guardian auth
    pipe_through :admin
    # pipe_through :browser
    live_dashboard "/dashboard",
      metrics: ApiWeb.Telemetry
  end

  scope "/auth" do
    pipe_through :json_api

    post "/token/refresh", ApiWeb.Auth.TokenController, :refresh
  end

  scope "/api" do
    pipe_through :auth

    forward "/", Absinthe.Plug,
      schema: ApiWeb.Schema,
      before_send: {__MODULE__, :absinthe_before_send}
  end

  scope "/_debug" do
    # health endpoint
    forward "/health", ApiWeb.HealthPlug
  end

  forward "/sitemap.xml", ApiWeb.SitemapPlug

  def absinthe_before_send(conn, %{execution: %{context: %{refresh_token: token}}}) do
    if is_nil(token) do
      delete_resp_cookie(conn, "SignInRefreshToken", http_only: true, same_site: "Lax")
    else
      put_resp_cookie(conn, "SignInRefreshToken", token,
        max_age: 21 * 24 * 60 * 60,
        http_only: true,
        encrypted: true,
        same_site: "Lax"
      )
    end
  end

  def absinthe_before_send(conn, _blueprint), do: conn
end
