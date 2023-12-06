defmodule Lotta.Tenants.Feedback do
  @moduledoc """
  Ecto Schema for feedbacks
  """

  use Ecto.Schema

  import Ecto.Changeset

  @type id() :: binary()

  @type t() :: %__MODULE__{
          id: id(),
          user_id: id(),
          topic: String.t(),
          content: String.t(),
          is_new: boolean(),
          is_forwarded: boolean(),
          is_responded: boolean(),
          metadata: String.t(),
          inserted_at: DateTime.t(),
          updated_at: DateTime.t()
        }

  @primary_key {:id, :binary_id, autogenerate: true}

  @timestamps_opts [type: :utc_datetime]

  schema "feedbacks" do
    field :topic, :string
    field :content, :string
    field :is_new, :boolean
    field :is_forwarded, :boolean
    field :is_responded, :boolean
    field :metadata, :string

    belongs_to :user, Lotta.Accounts.User

    timestamps()
  end

  def create_changeset(%__MODULE__{} = feedback, user, attrs) do
    feedback
    |> cast(attrs, [:topic, :content, :metadata])
    |> put_assoc(:user, user)
    |> validate_required([:topic, :content])
  end

  def set_is_forwarded_changeset(%__MODULE__{} = feedback) do
    feedback
    |> cast(%{is_forwarded: true}, [:is_forwarded])
    |> validate_required([:is_forwarded])
    |> validate_change(:is_forwarded, fn _ ->
      [is_forwarded: "Feedback wurde bereits weitergeleitet."]
    end)
  end
end
