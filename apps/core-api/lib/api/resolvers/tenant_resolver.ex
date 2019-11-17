defmodule Api.TenantResolver do
  alias Api.Tenants
  alias Api.Accounts.User

  def all(_args, _info) do
    {:ok, Tenants.list_tenants()}
  end

  def current(_args, %{context: %{tenant: tenant}}) do
    {:ok, tenant}
  end
  def current(_args, _info) do
    {:ok, nil}
  end

  def update(%{tenant: tenant_input}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && User.is_admin?(context.current_user, tenant) do
      tenant
      |> Tenants.update_tenant(tenant_input)
    else
      {:error, "Nur Administratoren dürfen das."}
    end
  end
end