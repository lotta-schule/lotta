defmodule Lotta.Accounts.UserDevice do
  @moduledoc """
  A device that a user has logged in with.
  This is used to track the devices that a user should receive push notifications on.
  He can then disable push notifications on a specific device.

  The device list can also serve as a security feature, as the user can see which devices
  have logged in.
  """
  use Ecto.Schema

  import Ecto.Changeset

  alias Lotta.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime_usec]

  @type id :: binary()

  @type t :: %__MODULE__{
          id: id,
          custom_name: String.t() | nil,
          platform: String.t(),
          device_type: String.t(),
          model_name: String.t(),
          last_used: DateTime.t(),
          push_token: String.t() | nil,
          push_token_type: String.t() | nil,
          active: boolean(),
          inserted_at: DateTime.t(),
          updated_at: DateTime.t()
        }

  schema "user_devices" do
    field :custom_name, :string
    field :platform, :string
    field :device_type, :string
    field :model_name, :string
    field :last_used, :utc_datetime_usec
    field :push_token, :string
    field :push_token_type, :string
    field :active, :boolean, default: true

    belongs_to :user, User, foreign_key: :user_id

    timestamps()
  end

  @doc false
  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(device, attrs) do
    device
    |> cast(attrs, [
      :custom_name,
      :platform,
      :device_type,
      :model_name,
      :push_token,
      :push_token_type,
      :active
    ])
    |> validate_required([:platform, :device_type, :model_name])
    |> validate_push_token_type()
  end

  @doc false
  @spec update_changeset(t(), map()) :: Ecto.Changeset.t()
  def update_changeset(device, attrs) do
    device
    |> cast(attrs, [
      :custom_name,
      :device_type,
      :push_token,
      :active
    ])
    |> validate_required([:platform, :device_type, :model_name])
    |> validate_push_token_type()
  end

  @doc """
  Validates that the push token type is set correctly.
  If the push token is set to nil, the push token type is also set to nil.
  If the push token is set, the push token type must be set.
  """
  @spec validate_push_token_type(Ecto.Changeset.t()) :: Ecto.Changeset.t()
  def validate_push_token_type(%Ecto.Changeset{} = changeset) do
    if get_field(changeset, :push_token) != nil do
      validate_required(changeset, :push_token_type)
    else
      put_change(changeset, :push_token_type, nil)
    end
  end
end
