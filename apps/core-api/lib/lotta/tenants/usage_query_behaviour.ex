defmodule Lotta.Tenants.UsageQueryBehaviour do
  @moduledoc false
  alias Lotta.Tenants.Tenant

  @callback get_usage(Tenant.t()) :: {:ok, list(map())}
end
