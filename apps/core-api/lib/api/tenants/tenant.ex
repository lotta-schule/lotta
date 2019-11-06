defmodule Api.Tenants.Tenant do
  use Ecto.Schema
  import Ecto.Changeset
  alias Api.Tenants.Category
  alias Api.Accounts
  alias Api.Accounts.{File,User,UserGroup}

  schema "tenants" do
    field :slug, :string
    field :title, :string
  
    has_many :categories, Category
    has_many :groups, UserGroup
    has_many :users, User
    belongs_to :logo_image_file, File, on_replace: :nilify

    timestamps()
  end

  @doc false
  def changeset(tenant, attrs) do
    tenant
    |> Api.Repo.preload(:logo_image_file)
    |> cast(attrs, [:slug, :title])
    |> put_assoc_logo_image_file(attrs)
    |> validate_required([:slug, :title])
  end

  defp put_assoc_logo_image_file(changeset, attrs) do
    case is_nil(attrs[:logo_image_file]) do
      false ->
        put_assoc(changeset, :logo_image_file, Accounts.get_file!(attrs.logo_image_file.id))
      _ ->
        changeset
    end
  end
end
