defmodule Api.Content.Article do
  use Ecto.Schema
  import Ecto.Changeset

  schema "articles" do
    field :page_name, :string
    field :preview, :string
    field :title, :string

    has_many :content_modules, Api.Content.ContentModule, on_replace: :delete

    belongs_to :user, Api.Accounts.User
    belongs_to :tenant, Api.Tenants.Tenant
    belongs_to :category, Api.Tenants.Category, on_replace: :nilify

    belongs_to :preview_image_file, Api.Accounts.File, on_replace: :nilify

    timestamps()
  end

  @doc false
  def changeset(article, attrs) do
    article
    |> Api.Repo.preload([:category, :preview_image_file, :content_modules])
    |> cast(attrs, [:title, :preview, :page_name, :category_id, :user_id, :tenant_id])
    |> validate_required([:title, :user_id, :tenant_id])
    |> put_assoc_category(attrs)
    |> put_assoc_preview_image_file(attrs)
    |> cast_assoc(:content_modules, required: false)
  end

  defp put_assoc_category(content_module, %{ category: %{ id: category_id } }) do
    content_module
    |> put_assoc(:category, Api.Repo.get(Api.Tenants.Category, String.to_integer(category_id)))
  end
  defp put_assoc_category(content_module, _args) do
    content_module
    |> put_assoc(:category, nil)
  end

  defp put_assoc_preview_image_file(content_module, %{ preview_image_file: %{ id: preview_image_file_id } }) do
    content_module
    |> put_assoc(:preview_image_file, Api.Repo.get(Api.Accounts.File, String.to_integer(preview_image_file_id)))
  end
  defp put_assoc_preview_image_file(content_module, _args) do
    content_module
    |> put_assoc(:preview_image_file, nil)
  end
end
