defmodule Lotta.TenantsUsageBehaviour do
  alias Lotta.Tenants.Tenant

  @callback create_usage_logs(Tenant.t()) :: :ok | {:error, any()}
  @callback refresh_monthly_usage_logs(keyword()) :: :ok | {:error, any()}
end
