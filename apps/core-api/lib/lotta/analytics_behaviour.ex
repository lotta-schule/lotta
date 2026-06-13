defmodule Lotta.AnalyticsBehaviour do
  @moduledoc false
  alias Lotta.Tenants.Tenant

  @callback create_site(Tenant.t()) :: :ok | {:error, any()}
end
