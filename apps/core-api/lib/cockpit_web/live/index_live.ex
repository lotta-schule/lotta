defmodule CockpitWeb.Live.IndexLive do
  use CockpitWeb, :live_view

  def render(assigns) do
    ~H"""
    <CockpitWeb.Layouts.admin current_url={@current_url} flash={@flash}>
      <h1>Welcome to Cockpit</h1>
      <p>This is the admin dashboard.</p>
    </CockpitWeb.Layouts.admin>
    """
  end
end
