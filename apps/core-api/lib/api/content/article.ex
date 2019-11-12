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
    belongs_to :group, Api.Accounts.UserGroup, on_replace: :nilify
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
  def create_changeset(article, attrs) do
    article
    |> Api.Repo.preload([:tenant, :category, :group, :users, :preview_image_file, :content_modules])
    |> cast(attrs, [:title, :inserted_at])
    |> validate_required([:title])
  end

  @doc false
  def changeset(article, attrs) do
    article
    |> Api.Repo.preload([:tenant, :category, :group, :users, :preview_image_file, :content_modules])
    |> cast(attrs, [:title, :inserted_at, :updated_at, :ready_to_publish, :preview, :topic])
    |> validate_required([:title])
    |> put_assoc_users(attrs)
    |> put_assoc_category(attrs)
    |> put_assoc_preview_image_file(attrs)
    |> put_assoc_group(attrs)
    |> cast_assoc(:content_modules, required: false)
  end


  defp put_assoc_users(changeset, %{users: users}) do
    users = Enum.map(users, fn user -> Api.Repo.get!(Api.Accounts.User, user.id) end)
    changeset
    |> put_assoc(:users, users)
  end
  defp put_assoc_users(changeset, _), do: changeset

  defp put_assoc_category(changeset, %{category: %{id: category_id}}) do
    changeset
    |> put_assoc(:category, Api.Repo.get(Api.Tenants.Category, category_id))
  end
  defp put_assoc_category(changeset, _), do: changeset

  defp put_assoc_preview_image_file(changeset, %{preview_image_file: %{id: preview_image_file_id}}) do
    changeset
    |> put_assoc(:preview_image_file, Api.Repo.get(Api.Accounts.File, preview_image_file_id))
  end
  defp put_assoc_preview_image_file(changeset, _), do: changeset
  
  defp put_assoc_group(changeset, %{group: %{id: group_id}}) do
    changeset
    |> put_assoc(:group, Api.Repo.get(Api.Accounts.UserGroup, group_id))
  end
  defp put_assoc_group(changeset, _), do: changeset
end
