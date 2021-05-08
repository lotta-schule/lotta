defmodule Api.MessagesTest do
  @moduledoc false

  use Api.DataCase

  alias Api.Fixtures
  alias Api.Messages
  alias Api.Messages.Message

  describe "messages" do
    test "list_for_user/1 should return a users' messages" do
      from = Fixtures.fixture(:registered_user, %{email: "hedwig@hogwarts.de"})
      to = Fixtures.fixture(:registered_user, %{email: "erol@hogwarts.de"})

      messages = [
        Fixtures.fixture(:message, from_id: from.id, to_id: to.id),
        Fixtures.fixture(:message, from_id: from.id, to_id: to.id),
        Fixtures.fixture(:message, from_id: from.id, to_id: to.id)
      ]

      assert Messages.list_for_user(from) == messages
      assert Messages.list_for_user(to) == messages
    end

    test "create_message/1 should create a message" do
      from = Fixtures.fixture(:registered_user, %{email: "hedwig@hogwarts.de"})
      to = Fixtures.fixture(:registered_user, %{email: "erol@hogwarts.de"})

      assert {:ok, message} =
               Messages.create_message(
                 Fixtures.fixture(:valid_message_attrs, from_id: from.id, to_id: to.id)
               )

      assert %Message{
               id: _id,
               content: "Das ist die Nachricht",
               sender_user: %{id: from_id},
               recipient_user: %{id: to_id}
             } = Api.Repo.preload(message, [:sender_user, :recipient_user])

      assert from_id == from.id
      assert to_id == to.id
    end
  end

  describe "delete messages" do
    test "delete_message/1 should delete a message" do
      from = Fixtures.fixture(:registered_user, %{email: "hedwig@hogwarts.de"})
      to = Fixtures.fixture(:registered_user, %{email: "erol@hogwarts.de"})

      assert {:ok, message} =
               Messages.create_message(
                 Fixtures.fixture(:valid_message_attrs, from_id: from.id, to_id: to.id)
               )

      assert {:ok, _message} = Messages.delete_message(message)

      assert_raise Ecto.NoResultsError, fn ->
        Api.Repo.get!(Message, message.id)
      end
    end
  end
end
