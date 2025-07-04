defmodule Lotta.MessagesTest do
  @moduledoc false

  use Lotta.DataCase

  alias Lotta.Fixtures
  alias Lotta.Messages
  alias Lotta.Messages.Message

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)

    :ok
  end

  describe "messages" do
    test "list_active_conversations/1 should return a users' conversations" do
      from = Fixtures.fixture(:registered_user, %{email: "hedwig@hogwarts.de"})
      to1 = Fixtures.fixture(:registered_user, %{email: "erol@hogwarts.de"})
      to2 = Fixtures.fixture(:registered_user, %{email: "santa@hogwarts.de"})
      fromto3 = Fixtures.fixture(:registered_user, %{email: "djingis@hogwarts.de"})

      conversation1 = Fixtures.fixture(:create_conversation_users, [from, to1])
      conversation2 = Fixtures.fixture(:create_conversation_users, [from, to2])
      conversation3 = Fixtures.fixture(:create_conversation_users, [fromto3, from])

      assert Enum.all?(Messages.list_active_conversations(from), fn conv ->
               conv == conversation1 || conv == conversation2 || conv == conversation3
             end)

      assert Messages.list_active_conversations(fromto3) == [conversation3]
    end

    test "set_user_has_last_seen_conversation" do
      user1 = Fixtures.fixture(:registered_user)
      user2 = Fixtures.fixture(:registered_user, %{email: "new@mymail.com"})
      conversation = Fixtures.fixture(:create_conversation_users, [user1, user2])

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
      user1 = Fixtures.fixture(:registered_user)
      user2 = Fixtures.fixture(:registered_user, %{email: "new@mymail.com"})
      conversation = Fixtures.fixture(:create_conversation_users, [user1, user2])

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
      user1 = Fixtures.fixture(:registered_user)
      user2 = Fixtures.fixture(:registered_user, %{email: "new@mymail.com"})
      conversation = Fixtures.fixture(:create_conversation_users, [user1, user2])

      users = Messages.list_conversation_users(conversation)

      assert Enum.count(users) == 2

      assert Enum.all?(users, fn user ->
               user == user1 || user == user2
             end)
    end

    test "list_conversation_users returns correct users for a group conversation" do
      user1 = Fixtures.fixture(:registered_user)
      user2 = Fixtures.fixture(:registered_user, %{email: "new@mymail.com"})
      user3 = Fixtures.fixture(:registered_user, %{email: "blabli@mymail.com"})

      group =
        Fixtures.fixture(:user_group)
        |> Repo.preload(:users)
        |> Ecto.Changeset.change(users: [user1, user2, user3])
        |> Repo.update!()

      conversation = Fixtures.fixture(:create_conversation_groups, [group])

      users = Messages.list_conversation_users(conversation)

      assert Enum.count(users) == 3

      assert Enum.all?(users, fn user ->
               user == user1 || user == user2 || user == user3
             end)
    end

    test "count unread messages" do
      user1 = Fixtures.fixture(:registered_user)
      user2 = Fixtures.fixture(:registered_user, %{email: "new@mymail.com"})
      conversation = Fixtures.fixture(:create_conversation_users, [user1, user2])

      {:ok, base_time} = DateTime.new(~D[2020-01-01], ~T[00:00:00], "Etc/UTC")

      user_messages =
        Enum.map(-7..6, fn delta ->
          date =
            DateTime.add(
              base_time,
              # delta hours
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
      from = Fixtures.fixture(:registered_user, %{email: "hedwig@hogwarts.de"})
      to = Fixtures.fixture(:registered_user, %{email: "erol@hogwarts.de"})

      assert {:error, %Ecto.Changeset{errors: errors, valid?: false}} =
               Messages.create_message(
                 from,
                 to,
                 "",
                 []
               )

      assert {"can't be blank", [validation: :required]} = Keyword.fetch!(errors, :content)
    end

    test "create_message/1 should create a message with files and text" do
      from = Fixtures.fixture(:registered_user, %{email: "hedwig@hogwarts.de"})
      to = Fixtures.fixture(:registered_user, %{email: "erol@hogwarts.de"})
      files = [Fixtures.fixture(:file, from), Fixtures.fixture(:file, from)]

      assert {:ok, message} =
               Messages.create_message(
                 from,
                 to,
                 Fixtures.fixture(:message_content),
                 files
               )

      assert %Message{
               id: _id,
               content: "Das ist die Nachricht",
               user: %{id: from_id},
               files: ^files
             } = Lotta.Repo.preload(message, [:user, :files])

      assert from_id == from.id
      # assert to_id == to.id
    end

    test "create_message/1 should create a message with only text" do
      from = Fixtures.fixture(:registered_user, %{email: "hedwig@hogwarts.de"})
      to = Fixtures.fixture(:registered_user, %{email: "erol@hogwarts.de"})

      assert {:ok, message} =
               Messages.create_message(
                 from,
                 to,
                 "This is text",
                 nil
               )

      assert %Message{
               id: _id,
               content: "This is text",
               user: %{id: from_id},
               files: []
             } = Lotta.Repo.preload(message, [:user, :files])

      assert from_id == from.id
      # assert to_id == to.id
    end

    test "create_message/1 should create a message with only files" do
      from = Fixtures.fixture(:registered_user, %{email: "hedwig@hogwarts.de"})
      to = Fixtures.fixture(:registered_user, %{email: "erol@hogwarts.de"})
      files = [Fixtures.fixture(:file, from), Fixtures.fixture(:file, from)]

      assert {:ok, message} =
               Messages.create_message(
                 from,
                 to,
                 nil,
                 files
               )

      assert %Message{
               id: _id,
               content: nil,
               user: %{id: from_id},
               files: ^files
             } = Lotta.Repo.preload(message, [:user, :files])

      assert from_id == from.id
      # assert to_id == to.id
    end
  end

  describe "delete messages" do
    test "delete_message/1 should delete a message" do
      from = Fixtures.fixture(:registered_user, %{email: "hedwig@hogwarts.de"})
      to = Fixtures.fixture(:registered_user, %{email: "erol@hogwarts.de"})

      assert {:ok, message} =
               Messages.create_message(
                 from,
                 to,
                 Fixtures.fixture(:message_content),
                 []
               )

      assert {:ok, _message} = Messages.delete_message(message)

      assert_raise Ecto.NoResultsError, fn ->
        Lotta.Repo.get!(Message, message.id)
      end
    end
  end
end
