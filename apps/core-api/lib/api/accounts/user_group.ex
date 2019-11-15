defmodule Api.Accounts.UserGroup do
  use Ecto.Schema
  import Ecto.Changeset

  alias Api.Accounts.User

  schema "user_groups" do
    field :name, :string
    field :sort_key, :integer
    field :is_admin_group, :boolean

    belongs_to :tenant, Api.Tenants.Tenant
    many_to_many :users,
      User,
      join_through: "user_user_group",
      on_replace: :delete

    timestamps()
  end

  @doc false
  def changeset(user_group, attrs) do
    user_group
    |> cast(attrs, [:name, :sort_key])
    |> validate_required([:name, :sort_key])
  end
end
