defmodule Lotta.Messages do
  @moduledoc """
  The Messages context.
  """

  import Ecto.Query

  require Logger

  alias Lotta.Repo
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Messages.{Conversation, Message}
  alias Lotta.Storage
  alias Lotta.Storage.File

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
  Get a conversation by id
  """
  @spec get_conversation(String.t()) :: Conversation.t() | nil
  def get_conversation(id) do
    Repo.get(Conversation, id)
  end

  @doc """
  Returns the date when a given user fetched messages for a given conversation.
  If the user never fetched the messages for a given conversation before, nil is returned.
  """
  @spec get_user_has_last_seen_conversation(User.t(), Conversation.t()) :: DateTime.t() | nil
  def get_user_has_last_seen_conversation(
        %User{id: user_id} = user,
        %Conversation{id: conversation_id}
      ) do
    query =
      from(culs in "conversation_user_last_seen",
        where: culs.user_id == ^user_id,
        where: culs.conversation_id == ^conversation_id,
        select: culs.last_seen
      )

    case Repo.all(query, prefix: Ecto.get_meta(user, :prefix)) do
      [datetime] ->
        datetime

      _ ->
        nil
    end
  end

  @doc """
  Returns the number of unread messages for a given user.
  Either pass a conversation, in which case the unread
  messages for that given conversation is given, 
  or skip for being given unread messages of all conversations.
  """
  @spec count_unread_messages(User.t(), Conversation.t() | nil) :: number()
  def count_unread_messages(%User{id: user_id} = user, conversation \\ nil) do
    conversations =
      if is_nil(conversation), do: list_active_conversations(user), else: [conversation]

    from(m in Message,
      left_join: culs in "conversation_user_last_seen",
      on: culs.conversation_id == m.conversation_id and culs.user_id == ^user_id,
      where: m.conversation_id in ^Enum.map(conversations, & &1.id),
      where: m.user_id != ^user_id,
      where: is_nil(culs.last_seen) or m.updated_at > culs.last_seen
    )
    |> Repo.aggregate(:count, prefix: Ecto.get_meta(user, :prefix))
  end

  @doc """
  Sets the datetime when a given user has last seen a given conversation.
  """
  @spec set_user_has_last_seen_conversation(User.t(), Conversation.t(), DateTime.t() | nil) ::
          :ok | :error
  def set_user_has_last_seen_conversation(
        %User{id: user_id} = user,
        %Conversation{id: conversation_id},
        datetime \\ DateTime.utc_now()
      ) do
    try do
      Repo.insert_all(
        "conversation_user_last_seen",
        [
          [
            user_id: user_id,
            conversation_id: UUID.string_to_binary!(conversation_id),
            last_seen: datetime
          ]
        ],
        prefix: Ecto.get_meta(user, :prefix),
        conflict_target: [:conversation_id, :user_id],
        on_conflict: {:replace, [:last_seen]}
      )

      :ok
    rescue
      e ->
        Logger.error(Exception.format(:error, e, __STACKTRACE__))
        Sentry.capture_exception(e)
        :error
    end
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
  @spec create_message(User.t(), User.t() | UserGroup.t(), String.t(), list(File.t())) ::
          {:ok, Message.t()} | {:error, Ecto.Changeset.t()}
  def create_message(from, to, content, files) do
    add_message = fn conversation, user, content, files ->
      conversation
      |> Ecto.build_assoc(:messages)
      |> Message.changeset(%{user_id: user.id, content: content, files: files})
      |> Repo.insert(prefix: Repo.get_prefix())
    end

    with {:ok, conversation} <- get_or_create_conversation(from, to),
         {:ok, message} <- add_message.(conversation, from, content, files) do
      Repo.update(
        Ecto.Changeset.change(conversation),
        force: true
      )

      {:ok, message}
    else
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
