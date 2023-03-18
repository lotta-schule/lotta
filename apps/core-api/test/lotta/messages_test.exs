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

      datetime = DateTime.utc_now()
      assert :ok = Messages.set_user_has_last_seen_conversation(user1, conversation, datetime)

      assert datetime =
               from(culs in "conversation_user_last_seen",
                 where: culs.user_id == ^user1.id,
                 where: culs.conversation_id == ^UUID.string_to_binary!(conversation.id),
                 select: culs.last_seen
               )
               |> Repo.all(prefix: @prefix)
               |> List.first()
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

    test "create_message/1 should create a message" do
      from = Fixtures.fixture(:registered_user, %{email: "hedwig@hogwarts.de"})
      to = Fixtures.fixture(:registered_user, %{email: "erol@hogwarts.de"})

      assert {:ok, message} =
               Messages.create_message(
                 from,
                 to,
                 Fixtures.fixture(:message_content)
               )

      assert %Message{
               id: _id,
               content: "Das ist die Nachricht",
               user: %{id: from_id}
             } = Lotta.Repo.preload(message, [:user])

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
                 Fixtures.fixture(:message_content)
               )

      assert {:ok, _message} = Messages.delete_message(message)

      assert_raise Ecto.NoResultsError, fn ->
        Lotta.Repo.get!(Message, message.id)
      end
    end
  end
end
