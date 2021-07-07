defmodule Lotta.Messages do
  @moduledoc """
  The Messages context.
  """

  import Ecto.Query

  alias Lotta.Repo
  alias Lotta.Accounts.User
  alias Lotta.Messages.Message

  @doc """
  Returns a list of messages from or for a given user.
  """
  @spec list_for_user(User.t()) :: [Message.t()]
  def list_for_user(%User{all_groups: groups} = user) do
    group_ids =
      groups
      |> Enum.map(& &1.id)

    from(m in Message,
      where:
        m.recipient_user_id == ^user.id or m.recipient_group_id in ^group_ids or
          m.sender_user_id == ^user.id,
      order_by: [desc: :updated_at]
    )
    |> Repo.all()
  end

  @doc """
  Create (= "send") a message
  """
  @spec create_message(map()) :: {:ok, Message.t()} | {:error, Ecto.Changeset.t()}
  def create_message(attrs) do
    %Message{}
    |> Message.changeset(attrs)
    |> Repo.insert(prefix: Repo.get_prefix())
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
    msg
    |> Repo.delete()
  end
end
