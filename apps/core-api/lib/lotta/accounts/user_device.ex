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
          platform_id: String.t(),
          device_type: String.t(),
          operating_system: String.t() | nil,
          model_name: String.t(),
          last_used: DateTime.t(),
          push_token: String.t() | nil,
          active: boolean(),
          inserted_at: DateTime.t(),
          updated_at: DateTime.t()
        }

  schema "user_devices" do
    field :custom_name, :string
    field :platform_id, :string
    field :model_name, :string
    field :device_type, :string
    field :operating_system, :string
    field :last_used, :utc_datetime_usec
    field :push_token, :string
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
      :platform_id,
      :device_type,
      :operating_system,
      :model_name,
      :push_token,
      :active
    ])
    |> validate_changeset()
  end

  @doc false
  @spec update_changeset(t(), map()) :: Ecto.Changeset.t()
  def update_changeset(device, attrs) do
    device
    |> cast(attrs, [
      :custom_name,
      :device_type,
      :push_token,
      :active,
    ])
    |> validate_changeset()
  end

  defp validate_changeset(changeset) do
    changeset
    |> validate_required([:platform_id])
    |> unique_constraint(:push_token)
    |> unique_constraint(:platform_id)
  end

end
