defmodule Api.System.Widget do
  @moduledoc """
    Ecto Schema for widgets
  """

  use Ecto.Schema
  alias Api.Repo
  import Ecto.Changeset
  import Ecto.Query
  alias Api.Accounts.UserGroup
  alias Api.Storage.File
  alias Api.System.Category

  @type id() :: pos_integer()

  @type t() :: %__MODULE__{id: id(), type: String.t()}

  @timestamps_opts [type: :utc_datetime]

  schema "widgets" do
    field :configuration, :map
    field :title, :string
    field :type, :string

    belongs_to :icon_image_file, File,
      on_replace: :nilify,
      type: :binary_id

    many_to_many :groups,
                 UserGroup,
                 join_through: "widgets_user_groups",
                 join_keys: [widget_id: :id, group_id: :id],
                 on_replace: :delete

    many_to_many :categories,
                 Category,
                 join_through: "categories_widgets",
                 on_replace: :delete

    timestamps()
  end

  def create_changeset(widget, attrs) do
    widget
    |> cast(attrs, [:title, :type])
    |> validate_required([:title, :type])
  end

  @doc false
  def changeset(widget, attrs) do
    widget
    |> Repo.preload([:groups, :icon_image_file])
    |> cast(attrs, [:title, :type, :configuration])
    |> validate_required([:title, :type, :configuration])
    |> put_assoc_icon_image_file(attrs)
    |> put_assoc_groups(attrs)
  end

  defp put_assoc_icon_image_file(changeset, %{icon_image_file: %{id: icon_image_file_id}}) do
    changeset
    |> put_assoc(:icon_image_file, Repo.get(File, icon_image_file_id))
  end

  defp put_assoc_icon_image_file(changeset, _args), do: changeset

  defp put_assoc_groups(changeset, %{groups: groups}) do
    changeset
    |> put_assoc(
      :groups,
      Repo.all(from(ug in UserGroup, where: ug.id in ^Enum.map(groups, & &1.id)))
    )
  end

  defp put_assoc_groups(changeset, _args), do: changeset
end
