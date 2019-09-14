defmodule Api.Tenants.Widget do
  use Ecto.Schema
  import Ecto.Changeset
  alias Api.Accounts.UserGroup
  alias Api.Tenants.{Tenant,Widget}

  schema "widgets" do
    field :configuration, :map
    field :title, :string
    field :type, :string

    belongs_to :group, UserGroup, on_replace: :nilify
    belongs_to :tenant, Tenant

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
    |> Api.Repo.preload(:group)
    |> cast(attrs, [:title, :type, :configuration])
    |> validate_required([:title, :type, :configuration])
    |> put_assoc_group(attrs)
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
