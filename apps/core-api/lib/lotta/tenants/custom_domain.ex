defmodule Lotta.Tenants.CustomDomain do
  @moduledoc """
    Ecto Schema for custom Domains
  """

  use Ecto.Schema

  @timestamps_opts [type: :utc_datetime]

  schema "custom_domains" do
    field(:host, :string)
    field(:is_main_domain, :boolean)

    belongs_to :tenant, Lotta.Tenants.Tenant

    timestamps()
  end
end
