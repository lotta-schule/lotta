defmodule Lotta.Accounts.UserGroup do
  @moduledoc """
    Ecto Schema for user groups.
  """

  use Ecto.Schema
  alias Lotta.Repo
  import Ecto.Changeset
  import Ecto.Query

  alias Lotta.Accounts.{User, UserGroup}

  @type id() :: pos_integer()

  @type t() :: %__MODULE__{
          id: id(),
          name: String.t(),
          sort_key: number(),
          is_admin_group: boolean()
        }

  @timestamps_opts [type: :utc_datetime]

  schema "user_groups" do
    field(:name, :string)
    field(:sort_key, :integer, default: 0)
    field(:is_admin_group, :boolean, default: false)
    field(:can_read_full_name, :boolean, default: false)

    field(:enrollment_tokens, {:array, :string}, default: [])

    field(:eduplaces_id, :string)

    many_to_many(
      :users,
      User,
      join_through: "user_user_group",
      on_replace: :delete
    )

    timestamps()
  end

  @doc false
  def update_changeset(%UserGroup{} = user_group, attrs) do
    user_group
    |> cast(attrs, [
      :name,
      :sort_key,
      :is_admin_group,
      :can_read_full_name,
      :enrollment_tokens,
      :eduplaces_id
    ])
    |> validate_required([:name, :sort_key])
  end

  def create_changeset(attrs) do
    %UserGroup{}
    |> update_changeset(attrs)
    |> validate_required([:enrollment_tokens])
  end

  def get_max_sort_key() do
    from(c in UserGroup, select: max(c.sort_key))
    |> Repo.one() || 0
  end
end
