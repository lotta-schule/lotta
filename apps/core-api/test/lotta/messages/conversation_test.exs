defmodule Lotta.Messages.ConversationTest do
  @moduledoc false

  use Lotta.DataCase

  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Messages.Conversation

  describe "conversation schema" do
    test "should throw an error when unhomogenous list is given" do
      assert_raise ArgumentError, fn ->
        Conversation.changeset(%Conversation{}, [%User{}, %UserGroup{}])
      end
    end

    test "should not be able to create a changeset with a single user" do
      changeset = Conversation.changeset(%Conversation{}, [%User{}])
      assert [{:users, _}] = changeset.errors
    end

    test "should create a valid changeset" do
      changeset = Conversation.changeset(%Conversation{}, [%UserGroup{}])
      assert changeset.valid?
    end
  end
end
