defmodule Lotta.AnalyticsBehaviour do
  alias Lotta.Tenants.Tenant

  @callback create_site(Tenant.t()) :: :ok | {:error, any()}
end
