defmodule Lotta.Tenants.DefaultContentBehaviour do
  alias Lotta.Accounts.User
  alias Lotta.Tenants.Tenant

  @callback create_default_content(Tenant.t(), User.t()) :: :ok | {:error, any()}
end
