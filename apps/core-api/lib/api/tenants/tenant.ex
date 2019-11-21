defmodule Api.Tenants.Tenant do
  use Ecto.Schema
  import Ecto.Changeset
  alias Api.Tenants.Category
  alias Api.Accounts
  alias Api.Accounts.{File,User,UserGroup}

  schema "tenants" do
    field :slug, :string
    field :title, :string
    field :custom_theme, :map
  
    has_many :categories, Category
    has_many :groups, UserGroup
    has_many :users, User
    belongs_to :logo_image_file, File, on_replace: :nilify
    belongs_to :background_image_file, File, on_replace: :nilify

    timestamps()
  end

  @doc false
  def changeset(tenant, attrs) do
    tenant
    |> Api.Repo.preload([:logo_image_file, :background_image_file])
    |> cast(attrs, [:title, :custom_theme])
    |> validate_required([:slug, :title])
    |> put_assoc_logo_image_file(attrs)
    |> put_assoc_background_image_file(attrs)
  end

  def get_main_url(%Api.Tenants.Tenant{slug: slug}) do
    base_url = Application.fetch_env!(:api, :base_url)
    "https://" <> slug  <> base_url
  end

  defp put_assoc_logo_image_file(changeset, attrs) do
    case is_nil(attrs[:logo_image_file]) do
      false ->
        put_assoc(changeset, :logo_image_file, Accounts.get_file!(attrs.logo_image_file.id))
      _ ->
        changeset
    end
  end
  
  defp put_assoc_background_image_file(changeset, attrs) do
    case is_nil(attrs[:background_image_file]) do
      false ->
        put_assoc(changeset, :background_image_file, Accounts.get_file!(attrs.background_image_file.id))
      _ ->
        changeset
    end
  end
end
