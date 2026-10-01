defmodule Lotta.Tenants.AdminBehaviour do
  @moduledoc false
  alias Lotta.Tenants.Tenant

  @callback delete_tenant(Tenant.t()) :: {:ok, Tenant.t()} | {:error, any()}
end
