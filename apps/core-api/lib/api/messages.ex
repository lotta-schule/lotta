defmodule Api.Messages do
  @moduledoc """
  The Messages context.
  """

  import Ecto.Query

  alias Api.Repo
  alias Api.Accounts.User
  alias Api.Messages.Message

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
    |> Repo.insert()
  end
end
