defmodule LottaWeb.Router do
  @moduledoc """
  Phoenix router
  """
  use LottaWeb, :router

  import Phoenix.LiveDashboard.Router

  pipeline :tenant do
    plug(LottaWeb.TenantPlug)
  end

  pipeline :auth do
    plug(LottaWeb.Auth.Pipeline)
  end

  pipeline :absinthe do
    plug(LottaWeb.Context)
  end

  pipeline :json_api do
    plug(:accepts, ~w(json))
  end

  scope "/" do
    pipe_through([:tenant, :auth])
    forward("/sitemap.xml", LottaWeb.SitemapPlug)
  end

  scope "/auth" do
    pipe_through([:tenant, :auth, :json_api])

    post("/token/refresh", LottaWeb.TokenController, :refresh)
  end

  scope "/storage" do
    pipe_through([:tenant, :auth])

    get("/f/:id", LottaWeb.StorageController, :get_file)
    get("/fc/:id", LottaWeb.StorageController, :get_file_conversion)
  end

  scope "/api" do
    pipe_through([:tenant, :auth, :absinthe])

    forward("/", Absinthe.Plug,
      schema: LottaWeb.Schema,
      before_send: {__MODULE__, :absinthe_before_send}
    )
  end

  scope "/admin-api" do
    pipe_through([:admin_auth, :json_api])

    post("/create-test", LottaWeb.TenantController, :create_test)
  end

  scope "/_debug" do
    # health endpoint
    forward("/health", LottaWeb.HealthPlug)

    live_dashboard("/dashboard",
      metrics: LottaWeb.Telemetry
    )

    if Mix.env() == :dev do
      # If using Phoenix
      forward("/mails", Bamboo.SentEmailViewerPlug)
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
    Plug.BasicAuth.basic_auth(conn, Application.get_env(:lotta, :admin_api_key))
  end
end
