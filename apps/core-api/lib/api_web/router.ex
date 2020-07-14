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
    plug :basic_auth, username: "admin", password: "d2jm8oj23ndhng3"
  end

  scope "/" do
    # add normal Guardian auth
    pipe_through :admin
    # pipe_through :browser
    live_dashboard "/dashboard",
      metrics: ApiWeb.Telemetry
  end

  scope "/api" do
    pipe_through :auth

    forward "/", Absinthe.Plug,
      schema: ApiWeb.Schema,
      before_send: {ApiWeb.Auth.AbsintheHooks, :before_send}
  end

  scope "/_debug" do
    # health endpoint
    forward "/health", ApiWeb.HealthPlug
  end

  forward "/sitemap.xml", ApiWeb.SitemapPlug
end
