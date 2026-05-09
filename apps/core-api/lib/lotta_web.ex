defmodule LottaWeb do
  @moduledoc """
  The entrypoint for defining your web interface, such
  as controllers, views, channels and so on.

  This can be used in your application as:

      use LottaWeb, :controller
      use LottaWeb, :html

  The definitions below will be executed for every view,
  controller, etc, so keep them short and clean, focused
  on imports, uses and aliases.

  Do NOT define functions inside the quoted expressions
  below. Instead, define any helper function in modules
  and import those modules here.
  """

  def static_paths, do: ~w(assets fonts images favicon.ico robots.txt)

  def router do
    quote do
      use Phoenix.Router, helpers: true

      import Plug.Conn
      import Phoenix.Controller
      import Phoenix.LiveView.Router
    end
  end

  def controller do
    quote do
      use Phoenix.Controller, formats: [:html, :json, :xml, :ics]

      use Gettext, backend: LottaWeb.Gettext

      import Plug.Conn

      use PhoenixHTMLHelpers
      unquote(verified_routes())
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
      import LottaWeb.Gettext
    end
  end

  def live_component do
    quote do
      use Phoenix.LiveComponent

      unquote(html_helpers())
    end
  end

  def html do
    quote do
      use Phoenix.Component

      # Import convenience functions from controllers
      import Phoenix.Controller,
        only: [get_csrf_token: 0, view_module: 1, view_template: 1]

      # Include general helpers for rendering HTML
      unquote(html_helpers())
    end
  end

  defp html_helpers do
    quote do
      # Translation
      use Gettext, backend: LottaWeb.Gettext

      # HTML escaping functionality
      import Phoenix.HTML
      # Core UI components
      # import LottaWeb.CoreComponents

      # Common modules used in templates
      alias Phoenix.LiveView.JS

      # Routes generation with the ~p sigil
      unquote(verified_routes())
    end
  end

  # This must be removed once we have a proper HTML view
  def view do
    quote do
      use Phoenix.View,
        root: "lib/lotta_web/templates",
        namespace: LottaWeb

      # Import convenience functions from controllers
      import Phoenix.Controller, only: [get_flash: 1, get_flash: 2, view_module: 1]

      import Phoenix.HTML
      import Phoenix.HTML.Form
      use PhoenixHTMLHelpers
      import LottaWeb.ErrorHelpers
      import LottaWeb.Gettext
      unquote(verified_routes())
    end
  end

  def verified_routes do
    quote do
      use Phoenix.VerifiedRoutes,
        endpoint: LottaWeb.Endpoint,
        router: LottaWeb.Router,
        statics: LottaWeb.static_paths()
    end
  end

  @doc """
  When used, dispatch to the appropriate controller/view/etc.
  """
  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
