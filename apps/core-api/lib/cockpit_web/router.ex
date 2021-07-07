defmodule CockpitWeb.Router do
  use CockpitWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers

    plug :admin_auth
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug CockpitWeb.Plug.Authentication
  end

  scope "/", CockpitWeb do
    pipe_through :browser

    get "/", PageController, :index

    resources "/tenants", TenantController, skip: [:edit]
  end

  scope "/api", CockpitWeb do
    pipe_through :api
    post "/feedback", FeedbackController, :create
    post "/create-test", TenantController, :create_test
  end

  # Other scopes may use custom stacks.
  # scope "/api", CockpitWeb do
  #   pipe_through :api
  # end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard", metrics: CockpitWeb.Telemetry
    end
  end

  if Mix.env() == :dev do
    # If using Phoenix
    forward "/sent_emails", Bamboo.SentEmailViewerPlug
  end

  defp admin_auth(conn, _opts) do
    conn
    |> Plug.BasicAuth.basic_auth(
      username: "admin",
      password:
        Keyword.fetch!(
          Application.fetch_env!(:lotta, :cockpit),
          :admin_api_key
        )
    )
  end
end
