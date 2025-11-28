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

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_live_flash)
    plug(:put_root_layout, html: {CockpitWeb.Layouts, :root})
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
    plug(:fetch_current_user)
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
end
