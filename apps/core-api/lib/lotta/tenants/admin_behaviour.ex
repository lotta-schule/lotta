defmodule Lotta.Tenants.AdminBehaviour do
  alias Lotta.Tenants.Tenant

  @callback delete_tenant(Tenant.t()) :: {:ok, Tenant.t()} | {:error, any()}
end
