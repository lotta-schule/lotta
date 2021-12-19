defmodule Lotta.Messages.Conversation do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset
  import Ecto.Query

  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Messages.Message

  @primary_key {:id, :binary_id, read_after_writes: true}

  @timestamps_opts [type: :utc_datetime]

  schema "conversations" do
    has_many :messages, Message

    many_to_many(
      :users,
      User,
      join_through: "conversation_user",
      on_replace: :delete
    )

    many_to_many(
      :groups,
      UserGroup,
      join_through: "conversation_group",
      on_replace: :delete
    )

    timestamps()
  end

  @type id :: pos_integer()

  @type t :: %__MODULE__{id: id}

  @type subjects_list :: list(User.t() | UserGroup.t())

  @doc """
  Get the query for fetching a conversation by providing the conversation subjects in a list.
  At the moment, these should either be 2 users or a group (pay attention, the group must be
  provided in a list).

  ## Examples
  iex> Lotta.Messages.Conversation.list_conversations_query!([%User{}, %User{}])
  %Ecto.Query{}

  iex> Lotta.Messages.Conversation.list_conversations_query!([%User{}, %Group{}])
  ** (throw) "Some elements in the list were not users"
  """
  @spec list_conversations_query!(subjects_list()) :: Ecto.Query.t()
  def list_conversations_query!(users_list) when is_struct(hd(users_list), User) do
    if not Enum.all?(users_list, &is_struct(&1, User)) do
      raise "Some elements in the list were not users"
    end

    conversation_id_query =
      from(c in __MODULE__,
        join: cu in "conversation_user",
        on: cu.conversation_id == c.id,
        where: cu.user_id in ^Enum.map(users_list, & &1.id),
        select: c.id,
        group_by: c.id,
        having: count() == ^length(users_list)
      )

    from(c in __MODULE__, where: c.id in subquery(conversation_id_query))
  end

  def list_conversations_query!(groups_list) when is_struct(hd(groups_list), UserGroup) do
    if not Enum.all?(groups_list, &is_struct(&1, UserGroup)) do
      raise "Some elements in the list were not groups"
    end

    conversation_id_query =
      from(c in __MODULE__,
        join: cu in "conversation_group",
        on: cu.conversation_id == c.id,
        where: cu.user_group_id in ^Enum.map(groups_list, & &1.id),
        select: c.id,
        group_by: c.id,
        having: count() == ^length(groups_list)
      )

    from(c in __MODULE__, where: c.id in subquery(conversation_id_query))
  end

  @doc false
  @spec changeset(%__MODULE__{}, subjects_list) :: Ecto.Changeset.t()
  def changeset(conversation, subjects) do
    conversation
    |> change()
    |> put_assoc_subjects_list(subjects)
    |> validate_length(:users, is: 2)
    |> validate_length(:groups, is: 1)
  end

  @doc false
  @spec put_assoc_subjects_list(Ecto.Changeset.t(), Lotta.Messages.Conversation.subjects_list()) ::
          Ecto.Changeset.t()

  defp put_assoc_subjects_list(changeset, [%User{} | _] = subjects) do
    put_assoc(changeset, :users, subjects)
  end

  defp put_assoc_subjects_list(changeset, subjects) do
    put_assoc(changeset, :groups, subjects)
  end
end
