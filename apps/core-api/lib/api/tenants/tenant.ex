defmodule Api.Tenants.Tenant do
  use Ecto.Schema
  import Ecto.Changeset
  alias Api.Tenants.Category
  alias Api.Accounts.{User,UserGroup}

  schema "tenants" do
    field :slug, :string
    field :title, :string
  
    has_many :categories, Category
    has_many :groups, UserGroup
    has_many :users, User

    timestamps()
  end

  @doc false
  def changeset(tenant, attrs) do
    tenant
    |> cast(attrs, [:slug, :title])
    |> validate_required([:slug, :title])
  end
end
