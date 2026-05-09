defmodule CockpitWeb.Layouts do
  @moduledoc """
  This module holds layouts and related functionality
  used by your application.
  """
  use CockpitWeb, :html

  import Phoenix.Component
  import Phoenix.LiveView

  alias CockpitWeb.UserAuth

  embed_templates("layouts/*")

  attr(:flash, :map, required: true, doc: "the map of flash messages")
  attr(:fluid?, :boolean, default: true, doc: "if the content uses full width")
  attr(:current_url, :string, required: true, doc: "the current url")

  attr(:current_scope, :map,
    default: nil,
    doc: "the current [scope](https://hexdocs.pm/phoenix/scopes.html)"
  )

  slot(:inner_block, required: true)

  def admin(assigns)

  def root(assigns)

  def on_mount(:default, params, %{"cockpit_jwt" => user_token} = session, socket) do
    socket =
      assign_new(socket, :current_user, fn ->
        UserAuth.get_user_from_token(user_token)
      end)

    if socket.assigns.current_user do
      Backpex.InitAssigns.on_mount(:default, params, session, socket)
    else
      {:halt, redirect(socket, to: ~p"/users/login")}
    end
  end
end
