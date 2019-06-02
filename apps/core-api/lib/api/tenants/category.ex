defmodule Api.Tenants.Category do
  use Ecto.Schema
  import Ecto.Changeset

  schema "categories" do
    field :title, :string

    belongs_to :category, Api.Tenants.Category
    belongs_to :tenant, Api.Tenants.Tenant

    timestamps()
  end

  @doc false
  def changeset(category, attrs) do
    category
    |> cast(attrs, [:title])
    |> validate_required([:title])
  end
end
