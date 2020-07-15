defmodule Api.Tenants.CustomDomain do
  @moduledoc """
    Ecto Schema for custom Domains
  """

  use Ecto.Schema
  alias Api.Tenants.Tenant

  schema "custom_domains" do
    field :host, :string
    field :is_main_domain, :boolean

    belongs_to :tenant, Tenant

    timestamps()
  end
end
