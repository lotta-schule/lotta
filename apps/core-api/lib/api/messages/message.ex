defmodule Api.Messages.Message do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset
  alias Api.Accounts.{User, UserGroup}

  @timestamps_opts [type: :utc_datetime]

  schema "messages" do
    field :content, :string

    belongs_to :sender_user, User
    belongs_to :recipient_user, User
    belongs_to :recipient_group, UserGroup

    timestamps()
  end

  @type id :: pos_integer()

  @type t :: %__MODULE__{id: id, content: String.t()}

  @doc false
  @spec changeset(__MODULE__.t(), map()) :: Ecto.Changeset.t()
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:content, :sender_user_id, :recipient_user_id, :recipient_group_id])
    |> validate_required([:content, :sender_user_id])
    |> validate_require_one([:recipient_user_id, :recipient_group_id])
  end

  @doc false
  @spec validate_require_one(Ecto.Changeset.t(), [atom()]) :: Ecto.Changeset.t()
  defp validate_require_one(%{changes: changes} = cs, required_keys) do
    if required_keys
       |> Enum.all?(fn key ->
         val = Map.get(changes, key)
         is_nil(val) or val == ""
       end) do
      validate_required(cs, List.first(required_keys))
    else
      cs
    end
  end
end
