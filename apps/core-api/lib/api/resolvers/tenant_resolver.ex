defmodule Api.TenantResolver do
  alias Api.Tenants

  def all(_args, _info) do
    {:ok, Tenants.list_tenants()}
  end

  def current(_args, %{context: %{context: %{tenant: tenant}}}) do
    {:ok, tenant}
  end
  def current(_args, _info) do
    {:ok, nil}
  end
end