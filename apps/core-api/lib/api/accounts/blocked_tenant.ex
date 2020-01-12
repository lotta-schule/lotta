defmodule Api.Accounts.BlockedTenant do
  use Ecto.Schema
  alias Api.Accounts.User
  alias Api.Tenants.Tenant

  schema "blocked_tenants" do
    belongs_to :tenant, Tenant
    belongs_to :user, User, on_replace: :nilify

    timestamps()
  end

end
