defmodule Api.Content.Article do
  use Ecto.Schema
  import Ecto.Changeset

  schema "articles" do
    field :title, :string
    field :preview, :string
    field :topic, :string
    field :ready_to_publish, :boolean
    field :is_pinned_to_top, :boolean
    
    belongs_to :tenant, Api.Tenants.Tenant, on_replace: :nilify
    belongs_to :category, Api.Tenants.Category, on_replace: :nilify
    belongs_to :preview_image_file, Api.Accounts.File, on_replace: :nilify
    
    has_many :content_modules, Api.Content.ContentModule, on_replace: :delete
    many_to_many(
      :users,
      Api.Accounts.User,
      join_through: "article_users",
      on_replace: :delete
    )

    timestamps()
  end

  @doc false
  def changeset(article, attrs) do
    article
    |> Api.Repo.preload([:category, :users, :preview_image_file, :content_modules])
    |> cast(attrs, [:title, :inserted_at, :ready_to_publish, :preview, :topic, :category_id])
    |> validate_required([:title])
    |> put_assoc(:users, attrs["users"] || [])
    |> put_assoc(:category, attrs["category"])
    |> put_assoc(:tenant, attrs["tenant"])
    |> put_assoc(:preview_image_file, attrs["preview_image_file"])
    |> cast_assoc(:content_modules, required: false)
  end
end
