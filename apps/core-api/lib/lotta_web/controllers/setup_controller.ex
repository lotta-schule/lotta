defmodule LottaWeb.SetupController do
  use LottaWeb, :controller

  alias LottaWeb.Urls
  alias Lotta.Tenants
  alias Lotta.Tenants.Tenant

  require Logger

  def status(conn, %{"slug" => slug}) do
    case Tenants.get_tenant_by_slug(slug) do
      %Tenant{state: :init} ->
        conn
        |> render(:status)

      %Tenant{state: state} = tenant when state in [:active, :readonly] ->
        conn
        |> redirect(external: Urls.get_tenant_url(tenant))

      _ ->
        conn
        |> put_status(:not_found)
        |> put_view(LottaWeb.OAuthHTML)
        |> render(:not_found,
          title: gettext("Tenant not found"),
          message: gettext("The requested tenant does not exist.")
        )
    end
  end
end
