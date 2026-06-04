defmodule Lotta.MessagesTest do
  @moduledoc false

  use Lotta.DataCase, async: true

  import Lotta.Factory

  alias Lotta.Messages
  alias Lotta.Messages.{Conversation, Message}

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)
    :ok
  end

  defp create_conversation_with_users(users) do
    %Conversation{}
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:users, users)
    |> Repo.insert!(prefix: @prefix)
  end

  defp create_conversation_with_groups(groups) do
    %Conversation{}
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:groups, groups)
    |> Repo.insert!(prefix: @prefix)
  end

  describe "messages" do
    test "list_active_conversations/1 should return a users' conversations" do
      from = insert(:user)
      to1 = insert(:user)
      to2 = insert(:user)
      fromto3 = insert(:user)

      conversation1 = create_conversation_with_users([from, to1])
      conversation2 = create_conversation_with_users([from, to2])
      conversation3 = create_conversation_with_users([fromto3, from])

      ids = [conversation1.id, conversation2.id, conversation3.id]

      assert Enum.all?(Messages.list_active_conversations(from), fn conv ->
               conv.id in ids
             end)

      assert [conv3] = Messages.list_active_conversations(fromto3)
      assert conv3.id == conversation3.id
    end

    test "set_user_has_last_seen_conversation" do
      user1 = insert(:user)
      user2 = insert(:user)
      conversation = create_conversation_with_users([user1, user2])

      datetime = ~N[2023-07-09 03:58:07]
      assert :ok = Messages.set_user_has_last_seen_conversation(user1, conversation, datetime)

      assert(
        datetime ==
          from(culs in "conversation_user_last_seen",
            where: culs.user_id == ^user1.id,
            where: culs.conversation_id == ^UUID.string_to_binary!(conversation.id),
            select: culs.last_seen
          )
          |> Repo.all(prefix: @prefix)
          |> List.first()
      )
    end

    test "get_user_has_last_seen_conversation" do
      user1 = insert(:user)
      user2 = insert(:user)
      conversation = create_conversation_with_users([user1, user2])

      Repo.insert_all(
        "conversation_user_last_seen",
        [
          [
            user_id: user1.id,
            conversation_id: UUID.string_to_binary!(conversation.id),
            last_seen: DateTime.utc_now()
          ]
        ],
        prefix: @prefix
      )
    end

    test "list_conversation_users returns correct users for a user conversation" do
      user1 = insert(:user)
      user2 = insert(:user)
      conversation = create_conversation_with_users([user1, user2])

      users = Messages.list_conversation_users(conversation)

      assert Enum.count(users) == 2

      assert Enum.all?(users, fn user ->
               user == user1 || user == user2
             end)
    end

    test "list_conversation_users returns correct users for a group conversation" do
      user1 = insert(:user)
      user2 = insert(:user)
      user3 = insert(:user)

      group =
        insert(:group)
        |> Repo.preload(:users)
        |> Ecto.Changeset.change(users: [user1, user2, user3])
        |> Repo.update!()

      conversation = create_conversation_with_groups([group])

      users = Messages.list_conversation_users(conversation)

      assert Enum.count(users) == 3

      assert Enum.all?(users, fn user ->
               user == user1 || user == user2 || user == user3
             end)
    end

    test "count unread messages" do
      user1 = insert(:user)
      user2 = insert(:user)
      conversation = create_conversation_with_users([user1, user2])

      {:ok, base_time} = DateTime.new(~D[2020-01-01], ~T[00:00:00], "Etc/UTC")

      user_messages =
        Enum.map(-7..6, fn delta ->
          date =
            DateTime.add(
              base_time,
              delta,
              :hour,
              Calendar.UTCOnlyTimeZoneDatabase
            )

          [
            user_id: user2.id,
            conversation_id: conversation.id,
            content: "Delta #{delta}",
            inserted_at: date,
            updated_at: date
          ]
        end)

      Repo.insert_all(Message, user_messages, prefix: @prefix)

      Repo.insert_all(
        "conversation_user_last_seen",
        [
          [
            user_id: user1.id,
            conversation_id: UUID.string_to_binary!(conversation.id),
            last_seen: base_time
          ]
        ],
        prefix: @prefix
      )

      assert 6 = Messages.count_unread_messages(user1)
    end
  end

  describe "create a message" do
    test "create_message/1 should not create a message if neither files nor content are given" do
      from = insert(:user)
      to = insert(:user)

      assert {:error, %Ecto.Changeset{errors: errors, valid?: false}} =
               Messages.create_message(from, to, "", [])

      assert {"can't be blank", [validation: :required]} = Keyword.fetch!(errors, :content)
    end

    test "create_message/1 should create a message with files and text" do
      from = insert(:user)
      to = insert(:user)
      files = [insert(:file, user_id: from.id), insert(:file, user_id: from.id)]

      assert {:ok, message} =
               Messages.create_message(from, to, "Das ist die Nachricht", files)

      assert %Message{
               id: _id,
               content: "Das ist die Nachricht",
               user: %{id: from_id},
               files: ^files
             } = Lotta.Repo.preload(message, [:user, :files])

      assert from_id == from.id
    end

    test "create_message/1 should create a message with only text" do
      from = insert(:user)
      to = insert(:user)

      assert {:ok, message} =
               Messages.create_message(from, to, "This is text", nil)

      assert %Message{
               id: _id,
               content: "This is text",
               user: %{id: from_id},
               files: []
             } = Lotta.Repo.preload(message, [:user, :files])

      assert from_id == from.id
    end

    test "create_message/1 should create a message with only files" do
      from = insert(:user)
      to = insert(:user)
      files = [insert(:file, user_id: from.id), insert(:file, user_id: from.id)]

      assert {:ok, message} =
               Messages.create_message(from, to, nil, files)

      assert %Message{
               id: _id,
               content: nil,
               user: %{id: from_id},
               files: ^files
             } = Lotta.Repo.preload(message, [:user, :files])

      assert from_id == from.id
    end
  end

  describe "delete messages" do
    test "delete_message/1 should delete a message" do
      from = insert(:user)
      to = insert(:user)

      assert {:ok, message} =
               Messages.create_message(from, to, "Das ist die Nachricht", [])

      assert {:ok, _message} = Messages.delete_message(message)

      assert_raise Ecto.NoResultsError, fn ->
        Lotta.Repo.get!(Message, message.id)
      end
    end
  end
end
