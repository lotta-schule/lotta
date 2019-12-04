defmodule Api.Tenants.CustomDomain do
  use Ecto.Schema
  alias Api.Tenants.Tenant

  schema "custom_domains" do
    field :host, :string
    field :is_main_domain, :boolean
  
    belongs_to :tenant, Tenant

    timestamps()
  end
end