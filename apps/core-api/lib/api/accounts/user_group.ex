defmodule Api.Accounts.UserGroup do
  @moduledoc """
    Ecto Schema for user groups.
  """

  use Ecto.Schema
  alias Api.Repo
  import Ecto.Changeset
  import Ecto.Query

  alias Ecto.Changeset
  alias Api.Accounts.{GroupEnrollmentToken, User, UserGroup}

  @type id() :: pos_integer()

  @type t() :: %__MODULE__{
          id: id(),
          name: String.t(),
          sort_key: number(),
          is_admin_group: boolean()
        }

  schema "user_groups" do
    field :name, :string
    field :sort_key, :integer
    field :is_admin_group, :boolean

    has_many :enrollment_tokens, GroupEnrollmentToken,
      foreign_key: :group_id,
      on_replace: :delete

    many_to_many :users,
                 User,
                 join_through: "user_user_group",
                 on_replace: :delete

    timestamps()
  end

  @doc false
  def changeset(%UserGroup{} = user_group, attrs) do
    user_group
    |> Repo.preload(:enrollment_tokens)
    |> cast(attrs, [:name, :sort_key, :is_admin_group])
    |> validate_required([:name, :sort_key])
    |> put_assoc_enrollment_tokens(attrs)
  end

  defp put_assoc_enrollment_tokens(%Changeset{} = user_group, %{enrollment_tokens: tokens}) do
    user_group
    |> put_assoc(:enrollment_tokens, Enum.map(tokens, &%{token: &1}))
  end

  defp put_assoc_enrollment_tokens(%Changeset{} = user_group, _args), do: user_group

  def get_max_sort_key() do
    from(c in UserGroup, select: max(c.sort_key))
    |> Repo.one()
  end
end
