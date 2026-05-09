defmodule CockpitWeb.ErrorHTML do
  @moduledoc """
  This module is invoked by your endpoint in case of errors on HTML requests.

  See config/config.exs.
  """
  use CockpitWeb, :html

  embed_templates("error_html/*")

  def render("404.html", assigns) do
    ~H"""
    <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
      <LottaWeb.Images.not_found />
      <h1 class="text-4xl font-bold mt-4">Page Not Found</h1>
      <p class="text-lg mt-2">The page you are looking for does not exist.</p>
    </div>
    """
  end

  def render("500.html", assigns) do
    ~H"""
    <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
      <LottaWeb.Images.server_error />
      <h1 class="text-4xl font-bold mt-4">Internal Server Error</h1>
      <p class="text-lg mt-2">Something went wrong.</p>
    </div>
    """
  end
end
