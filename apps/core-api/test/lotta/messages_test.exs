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
