defmodule LottaWeb.UrlsBehaviour do
  @moduledoc false
  alias Lotta.Tenants.Tenant

  @callback get_tenant_url(Tenant.t() | nil) :: String.t()
end
