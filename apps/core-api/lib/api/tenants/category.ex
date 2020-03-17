defmodule Api.Tenants.Category do
  use Ecto.Schema
  import Ecto.{Changeset,Query}
  use Api.ReadRepoAliaser
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
    belongs_to :category, Category
    belongs_to :tenant, Tenant
    many_to_many :groups,
      Api.Accounts.UserGroup,
      join_through: "categories_user_groups",
      join_keys: [category_id: :id, group_id: :id],
      on_replace: :delete
    many_to_many :widgets,
      Widget,
      join_through: "categories_widgets",
      on_replace: :delete

    timestamps()
  end

  @doc false
  def changeset(category, attrs) do
    category
    |> ReadRepo.preload([:banner_image_file, :groups, :widgets])
    |> cast(attrs, [:title, :redirect, :hide_articles_from_homepage, :is_sidenav, :sort_key])
    |> validate_required([:title])
    |> put_assoc_category(attrs)
    |> put_assoc_banner_image_file(attrs)
    |> put_assoc_groups(attrs)
    |> put_assoc_widgets(attrs)
  end

  defp put_assoc_banner_image_file(changeset, %{banner_image_file: %{id: banner_image_file_id}}) do
    changeset
    |> put_assoc(:banner_image_file, ReadRepo.get(Api.Accounts.File, banner_image_file_id))
  end
  defp put_assoc_banner_image_file(changeset, %{banner_image_file: nil}) do
    changeset
    |> put_assoc(:banner_image_file, nil)
  end
  defp put_assoc_banner_image_file(changeset, _args), do: changeset

  defp put_assoc_category(changeset, %{category: %{id: category_id}}) do
    changeset
    |> put_assoc(:category, ReadRepo.get(Api.Tenants.Category, category_id))
  end
  defp put_assoc_category(changeset, _args), do: changeset
  
  defp put_assoc_groups(changeset, %{groups: groups}) do
    changeset
    |> put_assoc(:groups, ReadRepo.all(from ug in UserGroup, where: ug.id in ^(Enum.map(groups, &(&1.id)))))
  end
  defp put_assoc_groups(changeset, _args), do: changeset

  defp put_assoc_widgets(changeset, %{widgets: widgets}) do
    widgets = ReadRepo.all(from w in Widget,
      where: w.id in ^(Enum.map(widgets, fn widget -> widget.id end))
    )
    changeset
    |> put_assoc(:widgets, widgets)
  end
  defp put_assoc_widgets(changeset, _args), do: changeset

  def get_max_sort_key(%Tenant{id: tenant_id}) do
    from(c in Category, where: c.tenant_id == ^tenant_id, select: max(c.sort_key))
    |> ReadRepo.one
  end

end
