defmodule Api.Tenants.Widget do
  use Ecto.Schema
  import Ecto.Changeset
  alias Api.Accounts.{File,UserGroup}
  alias Api.Tenants.{Category,Tenant}

  schema "widgets" do
    field :configuration, :map
    field :title, :string
    field :type, :string

    belongs_to :icon_image_file, File, on_replace: :nilify
    belongs_to :group, UserGroup, on_replace: :nilify
    belongs_to :tenant, Tenant
    many_to_many :categories,
      Category,
      join_through: "categories_widgets",
      on_replace: :delete

    timestamps()
  end

  def create_changeset(widget, attrs) do
    widget
    |> cast(attrs, [:title, :type, :tenant_id])
    |> validate_required([:title, :type, :tenant_id])
  end

  @doc false
  def changeset(widget, attrs) do
    widget
    |> Api.Repo.preload([:group, :icon_image_file])
    |> cast(attrs, [:title, :type, :configuration])
    |> validate_required([:title, :type, :configuration])
    |> put_assoc_icon_image_file(attrs)
    |> put_assoc_group(attrs)
  end

  defp put_assoc_icon_image_file(widget, %{icon_image_file: %{id: icon_image_file_id}}) do
    widget
    |> put_assoc(:icon_image_file, Api.Repo.get(Api.Accounts.File, icon_image_file_id))
  end
  defp put_assoc_icon_image_file(widget, _args) do
    widget
    |> put_assoc(:icon_image_file, nil)
  end

  defp put_assoc_group(article, %{group: %{id: group_id}}) do
    article
    |> put_assoc(:group, Api.Repo.get(Api.Accounts.UserGroup, group_id))
  end
  defp put_assoc_group(article, _args) do
    article
    |> put_assoc(:group, nil)
  end
end
