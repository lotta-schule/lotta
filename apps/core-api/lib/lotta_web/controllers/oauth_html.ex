defmodule LottaWeb.OAuthHTML do
  @moduledoc false
  use LottaWeb, :html

  embed_templates("error_html/*")

  def error(assigns) do
    ~H"""
    <LottaWeb.ErrorHTML.fullsize_error title={@title} message={@message} image="server_error" />
    """
  end

  def bad_request(assigns) do
    ~H"""
    <LottaWeb.ErrorHTML.fullsize_error title={@title} message={@message} image="server_error" />
    """
  end

  def not_found(assigns) do
    ~H"""
    <LottaWeb.ErrorHTML.fullsize_error title={@title} message={@message} image="not_found" />
    """
  end

  def no_tenant(assigns) do
    ~H"""
    <LottaWeb.ErrorHTML.fullsize_error
      title={gettext("You're lotta is being made ready at this moment.")}
      message={gettext("Just a few more seconds")}
      image="tenant_not_found"
    />
    """
  end
end
