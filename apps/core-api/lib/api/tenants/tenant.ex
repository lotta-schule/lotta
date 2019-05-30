defmodule Api.Tenants.Tenant do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tenants" do
    field :slug, :string
    field :title, :string
    has_many :categories, Api.Tenants.Category

    timestamps()
  end

  @doc false
  def changeset(tenant, attrs) do
    tenant
    |> cast(attrs, [:slug, :title])
    |> validate_required([:slug, :title])
  end
end
