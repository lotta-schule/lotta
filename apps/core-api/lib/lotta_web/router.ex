defmodule LottaWeb.Router do
  @moduledoc """
  Phoenix router
  """
  use LottaWeb, :router

  import Phoenix.LiveDashboard.Router
  import Oban.Web.Router

  pipeline :browser do
    plug(:accepts, ~w(html))
  end

  pipeline :browser do
    plug(:accepts, ~w(html))
  end

  pipeline :json_api do
    plug(:accepts, ~w(json))
  end

  pipeline :ics do
    plug(:accepts, ~w(ics))
  end

  scope "/auth" do
    scope "/" do
      pipe_through(:browser)

      get("/callback", LottaWeb.OAuthController, :tenant_callback)
    end

    scope "/oauth" do
      pipe_through(:browser)

      get("/:provider/login", LottaWeb.OAuthController, :login)
      get("/:provider/callback", LottaWeb.OAuthController, :callback)
      # provider param is ignored, as we get the provider from ?ssi query param
      # it probably would better to move this to /auth/oauth/request_login
      get("/:provider/authorize", LottaWeb.OAuthController, :request_login)
    end

    scope "/token" do
      pipe_through(:json_api)

      post("/refresh", LottaWeb.SessionController, :refresh)
    end

    scope "/" do
      pipe_through([:browser, :json_api])

      post("/login", LottaWeb.SessionController, :login)
      get("/logout", LottaWeb.SessionController, :logout)
    end
  end

  # /storage endpoint could (and probably should) be moved to /data/storage
  scope "/storage" do
    get("/f/:id", LottaWeb.StorageController, :get_file)
    get("/fc/:id", LottaWeb.StorageController, :get_file_conversion)
  end

  scope "/data" do
    forward("/sitemap.xml", LottaWeb.SitemapPlug)

    forward("/sitemap.xml", LottaWeb.SitemapPlug)

    scope "/storage" do
      get("/f/:id/:format", LottaWeb.StorageController, :get_file_format)
    end

    scope "/calendar" do
      pipe_through([:ics])
      get("/:id/ics", LottaWeb.CalendarController, :get, as: :calendar_ics)
    end
  end

  scope "/api" do
    scope "/public" do
      pipe_through([:json_api])

      get("/user-tenants", LottaWeb.TenantController, :list_user_tenants)
    end

    scope "/" do
      forward("/", Absinthe.Plug,
        schema: LottaWeb.Schema,
        before_send: {__MODULE__, :absinthe_before_send}
      )
    end
  end

  scope "/setup" do
    pipe_through(:browser)

    get("/:slug/status", LottaWeb.SetupController, :status)
  end

  scope "/admin-api" do
    pipe_through([:admin_auth, :json_api])

    post("/create-test", LottaWeb.TenantController, :create_test)
    post("/delete-tenant", LottaWeb.TenantController, :delete_tenant)
  end

  scope "/admin" do
    pipe_through([:admin_auth])

    live_dashboard("/live", metrics: LottaWeb.Telemetry)
    oban_dashboard("/oban")

    scope "/api" do
      pipe_through(:json_api)

      post("/create-test", LottaWeb.TenantController, :create_test)
      post("/delete-tenant", LottaWeb.TenantController, :delete_tenant)
    end
  end

  scope "/_debug" do
    # health endpoint
    forward("/health", LottaWeb.HealthPlug)

    scope "/mails" do
      forward(
        "/view",
        LottaWeb.SentEmailViewPlug
      )

      forward(
        "/api",
        LottaWeb.SentEmailApiPlug
      )
    end
  end

  def absinthe_before_send(conn, %{execution: %{context: %{refresh_token: token}}}) do
    if is_nil(token) do
      delete_resp_cookie(conn, "SignInRefreshToken", http_only: true, same_site: "Lax")
    else
      put_resp_cookie(conn, "SignInRefreshToken", token,
        max_age: 21 * 24 * 60 * 60,
        http_only: true,
        same_site: "Lax"
      )
    end
  end

  def absinthe_before_send(conn, _blueprint), do: conn

  defp admin_auth(conn, _opts) do
    conn
    |> Plug.BasicAuth.basic_auth(
      Application.get_env(:lotta, :cockpit)
      |> Keyword.take([:username, :password])
    )
  end
end
