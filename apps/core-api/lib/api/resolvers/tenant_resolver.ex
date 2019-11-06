defmodule Api.TenantResolver do
  alias Api.Tenants
  alias Api.Accounts.User

  def all(_args, _info) do
    {:ok, Tenants.list_tenants()}
  end

  def current(_args, %{context: %{context: %{tenant: tenant}}}) do
    {:ok, tenant}
  end
  def current(_args, _info) do
    {:ok, nil}
  end

  def update(%{tenant: tenant_input}, %{context: %{context: %{tenant: tenant, current_user: current_user}}}) do
    if User.is_admin?(current_user, tenant) do
      tenant
      |> Tenants.update_tenant(tenant_input)
    else
      {:error, "Nur Administratoren dürfen das."}
    end
  end
end