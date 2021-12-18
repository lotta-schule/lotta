defmodule Lotta.Messages.Message do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset
  alias Lotta.Accounts.User
  alias Lotta.Messages.Conversation

  @timestamps_opts [type: :utc_datetime]

  schema "messages" do
    field :content, :string

    belongs_to :user, User
    belongs_to :conversation, Conversation, type: :binary_id, on_replace: :delete

    timestamps()
  end

  @type id :: pos_integer()

  @type t :: %__MODULE__{id: id, content: String.t()}

  @doc false
  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:content, :user_id])
    |> validate_required([:content, :user_id])
    |> validate_required([:conversation_id])
  end
end
