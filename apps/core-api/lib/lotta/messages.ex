defmodule Lotta.Messages do
  @moduledoc """
  The Messages context.
  """

  import Ecto.Query

  alias Lotta.Repo
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Messages.{Conversation, Message}

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  def query(queryable, _params) do
    queryable
    |> order_by(desc: :updated_at, desc: :inserted_at, desc: :id)
  end

  @doc """
  Returns a list of active conversations for a given user
  Active conversations for a user are:

  - conversations which include the user
  - conversations which include any group of which the user is member
  """
  @spec list_active_conversations(User.t()) :: [Conversation.t()]
  def list_active_conversations(%User{all_groups: groups} = user) do
    group_ids = Enum.map(groups, & &1.id)

    user_conversations_query =
      from(c in Conversation,
        join: cu in "conversation_user",
        on: cu.conversation_id == c.id,
        where: cu.user_id == ^user.id
      )

    group_conversations_query =
      from(c in Conversation,
        join: cg in "conversation_group",
        on: cg.conversation_id == c.id,
        where: cg.user_group_id in ^group_ids
      )

    union(user_conversations_query, ^group_conversations_query)
    |> order_by(fragment("updated_at DESC, inserted_at DESC, id DESC"))
    |> Repo.all()
  end

  @doc """
  Request for a conversation from a given user to either another
  user or to a group.

  - If the target is a user, the database will be searched for an
  existing conversation between those two users.
  - If the target is a group, the database will be searched for an
  existing conversation for this group.

  If an existing conversation is not found, one is created and
  returned.
  """
  @spec get_or_create_conversation(User.t(), User.t() | UserGroup.t()) ::
          {:ok, Conversation.t()} | {:error, term()}
  def get_or_create_conversation(%User{} = from, to) do
    conversation_subjects = if is_struct(to, User), do: [from, to], else: [to]

    conversation_subjects
    |> Conversation.list_conversations_query!()
    |> Repo.all()
    |> List.first()
    |> case do
      nil ->
        create_conversation(conversation_subjects)

      conversation ->
        {:ok, conversation}
    end
  end

  @doc """

  """
  @spec get_conversation(String.t()) :: Conversation.t() | nil
  def get_conversation(id) do
    Repo.get(Conversation, id)
  end

  @doc """
  Create a new conversation.
  Takes the conversation subjects and will return a tuple with
  either {:ok, %Conversation{}} or {:error, %Changeset}.

  You shouldn't need to call this function explicitly, most of the
  time you should get one through `Lotta.Messages.get_or_create_conversation`.
  """
  @spec create_conversation(Conversation.subjects_list()) ::
          {:ok, Conversation.t()} | {:error, term()}
  def create_conversation(subjects) do
    %Conversation{}
    |> Conversation.changeset(subjects)
    |> Repo.insert(prefix: Repo.get_prefix())
  end

  @doc """
  Create (= "send") a message
  """
  @spec create_message(User.t(), User.t() | UserGroup.t(), String.t()) ::
          {:ok, Message.t()} | {:error, Ecto.Changeset.t()}
  def create_message(from, to, content) do
    case get_or_create_conversation(from, to) do
      {:ok, conversation} ->
        conversation
        |> Ecto.build_assoc(:messages)
        |> Message.changeset(%{user_id: from.id, content: content})
        |> Repo.insert(prefix: Repo.get_prefix())

      error ->
        error
    end
  end

  @doc """
  Get a message by id
  """
  @spec get_message(String.t()) :: Message.t() | nil
  def get_message(id) do
    Repo.get(Message, String.to_integer(id))
  end

  @doc """
  Delete a message
  """
  @doc since: "2.5.0"
  @spec delete_message(Message.t()) :: {:ok, Message.t()} | {:error, Ecto.Changeset.t()}
  def delete_message(%Message{} = msg) do
    Repo.delete(msg)
  end
end
