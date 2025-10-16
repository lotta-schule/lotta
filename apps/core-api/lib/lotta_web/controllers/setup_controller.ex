defmodule LottaWeb.SetupController do
  use LottaWeb, :controller

  alias LottaWeb.Urls
  alias Lotta.Tenants.Tenant

  require Logger

  def status(%{private: %{lotta_tenant: %Tenant{state: :init}}} = conn, _params),
    do:
      conn
      |> render(:status)

  def status(%{private: %{lotta_tenant: %Tenant{state: state} = tenant}} = conn, _params)
      when state in [:active, :readonly],
      do:
        conn
        |> redirect(external: Urls.get_tenant_url(tenant))

  def status(conn, _params),
    do:
      conn
      |> put_status(:not_found)
      |> put_view(LottaWeb.OAuthHTML)
      |> render(:not_found,
        title: gettext("Tenant not found"),
        message: gettext("The requested tenant does not exist.")
      )
end
