defmodule Api.Tenants.Category do
  use Ecto.Schema
  import Ecto.Changeset
  alias Api.Accounts.{File,UserGroup}
  alias Api.Tenants.{Tenant}

  schema "categories" do
    field :title, :string
    field :sort_key, :integer
    field :redirect, :string

    belongs_to :banner_image_file, File
    belongs_to :group, UserGroup
    belongs_to :category, Api.Tenants.Category
    belongs_to :tenant, Tenant

    timestamps()
  end

  @doc false
  def changeset(category, attrs) do
    category
    |> Api.Repo.preload([:banner_image_file, :group])
    |> cast(attrs, [:title, :redirect, :sort_key])
    |> validate_required([:title])
    |> put_assoc_banner_image_file(attrs)
    |> put_assoc_group(attrs)
  end

  defp put_assoc_banner_image_file(article, %{ banner_image_file: %{ id: banner_image_file_id } }) do
    article
    |> put_assoc(:banner_image_file, Api.Repo.get(Api.Accounts.File, banner_image_file_id))
  end
  defp put_assoc_banner_image_file(article, _args) do
    article
    |> put_assoc(:banner_image_file, nil)
  end
  
  defp put_assoc_group(article, %{ group: %{ id: group_id } }) do
    article
    |> put_assoc(:group, Api.Repo.get(Api.Accounts.UserGroup, group_id))
  end
  defp put_assoc_group(article, _args) do
    article
    |> put_assoc(:group, nil)
  end

end
