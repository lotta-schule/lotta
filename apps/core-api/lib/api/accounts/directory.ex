defmodule Api.Accounts.Directory do
  use Ecto.Schema
  import Ecto.Changeset

  schema "directories" do
    field :name, :string

    belongs_to :user, Api.Accounts.User
    belongs_to :tenant, Api.Tenants.Tenant
    belongs_to :parent_directory, Api.Accounts.Directory
    belongs_to :group, Api.Accounts.UserGroup

    timestamps()
  end

    @doc false
  def changeset(%Api.Accounts.Directory{} = directory, attrs) do
    directory
    |> cast(attrs, [:name, :user_id, :tenant_id, :parent_directory_id])
    |> validate_required([:name, :user_id, :tenant_id])
    |> unique_constraint(:name, name: :directories_name_parent_directory_id_user_id_tenant_id_index)
  end
end
