defmodule Api.Content.Article do
  use Ecto.Schema
  import Ecto.Changeset

  schema "articles" do
    field :page_name, :string
    field :preview, :string
    field :title, :string
    field :preview_image_url, :string

    has_many :content_modules, Api.Content.ContentModule

    belongs_to :user, Api.Accounts.User
    belongs_to :tenant, Api.Tenants.Tenant
    belongs_to :category, Api.Tenants.Category

    timestamps()
  end

  @doc false
  def changeset(article, attrs) do
    article
    |> cast(attrs, [:title, :preview, :page_name])
    |> validate_required([:title, :preview, :page_name])
  end
end
