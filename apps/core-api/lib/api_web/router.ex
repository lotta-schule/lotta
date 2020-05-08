defmodule ApiWeb.Router do
  use ApiWeb, :router
  import Plug.BasicAuth
  import Phoenix.LiveDashboard.Router

  if Application.get_env(:honeybadger, :api_key) do
    use Honeybadger.Plug
  end

  pipeline :auth do
    plug Guardian.Plug.Pipeline,
      module: Api.Guardian,
      error_handler: Api.Guardian.AuthErrorHandler

    # plug Guardian.Plug.VerifySession, %{"typ" => "access"}
    # plug Guardian.Plug.VerifyCookie, %{"typ" => "access"}
    # plug Guardian.Plug.LoadResource
    plug ApiWeb.Context
  end

  pipeline :admin do
    plug :basic_auth, username: "admin", password: "d2jm8oj23ndhng3"
  end

  if Mix.env() == :dev do
    scope "/" do
      # pipe_through :browser
      live_dashboard "/dashboard",
        metrics: ApiWeb.Telemetry
    end
  end

  scope "/api" do
    pipe_through :auth

    forward "/", Absinthe.Plug,
      schema: ApiWeb.Schema,
      before_send: {ApiWeb.AbsintheHooks, :before_send}
  end

  scope "/_debug" do
    # health endpoint
    forward "/health", ApiWeb.HealthPlug
  end

  forward "/sitemap.xml", ApiWeb.SitemapPlug

end
