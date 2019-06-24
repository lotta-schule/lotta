defmodule Api.Content.Article do
  use Ecto.Schema
  import Ecto.Changeset

  schema "articles" do
    field :page_name, :string
    field :preview, :string
    field :title, :string
    field :preview_image_url, :string

    has_many :content_modules, Api.Content.ContentModule, on_replace: :delete

    belongs_to :user, Api.Accounts.User
    belongs_to :tenant, Api.Tenants.Tenant
    belongs_to :category, Api.Tenants.Category

    timestamps()
  end

  @doc false
  def changeset(article, attrs) do
    article
    |> Api.Repo.preload(:content_modules)
    |> cast(attrs, [:title, :preview, :page_name, :category_id, :user_id, :tenant_id])
    |> validate_required([:title, :user_id, :tenant_id])
    |> cast_assoc(:content_modules, required: false)
  end
end
