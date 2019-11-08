defmodule Api.Tenants.Category do
  use Ecto.Schema
  import Ecto.{Changeset,Query}
  alias Api.Repo
  alias Api.Accounts.{File,UserGroup}
  alias Api.Tenants.{Category,Tenant,Widget}

  schema "categories" do
    field :title, :string
    field :sort_key, :integer
    field :is_sidenav, :boolean
    field :is_homepage, :boolean
    field :redirect, :string
    field :hide_articles_from_homepage, :boolean

    belongs_to :banner_image_file, File, on_replace: :nilify
    belongs_to :group, UserGroup, on_replace: :nilify
    belongs_to :category, Category
    belongs_to :tenant, Tenant
    many_to_many :widgets,
      Widget,
      join_through: "categories_widgets",
      on_replace: :delete

    timestamps()
  end

  @doc false
  def changeset(category, attrs) do
    category
    |> Api.Repo.preload([:banner_image_file, :group, :widgets])
    |> cast(attrs, [:title, :redirect, :hide_articles_from_homepage, :sort_key])
    |> validate_required([:title])
    |> put_assoc_banner_image_file(attrs)
    |> put_assoc_group(attrs)
    |> put_assoc_widgets(attrs)
  end

  defp put_assoc_banner_image_file(article, %{banner_image_file: %{id: banner_image_file_id}}) do
    article
    |> put_assoc(:banner_image_file, Api.Repo.get(Api.Accounts.File, banner_image_file_id))
  end
  defp put_assoc_banner_image_file(article, _args) do
    article
    |> put_assoc(:banner_image_file, nil)
  end
  
  defp put_assoc_group(article, %{group: %{id: group_id}}) do
    article
    |> put_assoc(:group, Api.Repo.get(Api.Accounts.UserGroup, group_id))
  end
  defp put_assoc_group(article, _args) do
    article
    |> put_assoc(:group, nil)
  end

  defp put_assoc_widgets(category, %{widgets: widgets}) do
    widgets = Repo.all(from w in Widget,
      where: w.id in ^(Enum.map(widgets, fn widget -> widget.id end))
    )
    category
    |> put_assoc(:widgets, widgets)
  end
  defp put_assoc_widgets(category, _args) do
    category
    |> put_assoc(:widgets, nil)
  end

end
