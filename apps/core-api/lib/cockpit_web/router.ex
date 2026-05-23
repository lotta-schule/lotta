defmodule CockpitWeb.Router do
  @moduledoc """
  Phoenix router
  """
  use CockpitWeb, :router

  alias CockpitWeb.UserSessionController

  import Phoenix.LiveView.Router
  import Backpex.Router

  import CockpitWeb.UserAuth,
    only: [
      redirect_if_user_is_authenticated: 2,
      require_authenticated_user: 2,
      fetch_current_user: 2
    ]

  pipeline :json_api do
    plug(:accepts, ~w(json))
  end

  pipeline :basic_auth do
    plug(:admin_basic_auth)
  end

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_live_flash)
    plug(:put_root_layout, html: {CockpitWeb.Layouts, :root})
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
    plug(:fetch_current_user)
  end

  scope "/api" do
    pipe_through([:basic_auth, :json_api])

    scope "/banking" do
      post("/ingest", CockpitWeb.BankingApiController, :ingest)
    end
  end

  scope "/" do
    scope "/users" do
      pipe_through([:browser, :redirect_if_user_is_authenticated])

      get("/login", UserSessionController, :new, as: :login)
      post("/login", UserSessionController, :create)
    end

    scope "/users" do
      pipe_through([:browser, :require_authenticated_user])
      get("/logout", UserSessionController, :delete, as: :logout)
    end

    scope "/" do
      pipe_through([:browser, :require_authenticated_user])

      backpex_routes()

      live_session :default, on_mount: CockpitWeb.Layouts do
        live("/", CockpitWeb.Live.IndexLive)
        live_resources("/tenants", CockpitWeb.Live.TenantLive)
        live_resources("/invoices", CockpitWeb.Live.InvoiceLive)
      end
    end
  end

  defp admin_basic_auth(conn, _opts) do
    Plug.BasicAuth.basic_auth(
      conn,
      Application.get_env(:lotta, :cockpit)
      |> Keyword.take([:username, :password])
    )
  end
end
