defmodule ApiWeb.TenantController do
  use ApiWeb, :controller

  alias Api.Tenants
  alias Api.Tenants.Tenant

  action_fallback ApiWeb.FallbackController

  def index(conn, _params) do
    tenants = Tenants.list_tenants()
    render(conn, "index.json", tenants: tenants)
  end

  def create(conn, %{"tenant" => tenant_params}) do
    with {:ok, %Tenant{} = tenant} <- Tenants.create_tenant(tenant_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.tenant_path(conn, :show, tenant))
      |> render("show.json", tenant: tenant)
    end
  end

  def show(conn, %{"id" => id}) do
    tenant = Tenants.get_tenant!(id)
    render(conn, "show.json", tenant: tenant)
  end

  def update(conn, %{"id" => id, "tenant" => tenant_params}) do
    tenant = Tenants.get_tenant!(id)

    with {:ok, %Tenant{} = tenant} <- Tenants.update_tenant(tenant, tenant_params) do
      render(conn, "show.json", tenant: tenant)
    end
  end

  def delete(conn, %{"id" => id}) do
    tenant = Tenants.get_tenant!(id)

    with {:ok, %Tenant{}} <- Tenants.delete_tenant(tenant) do
      send_resp(conn, :no_content, "")
    end
  end
end
