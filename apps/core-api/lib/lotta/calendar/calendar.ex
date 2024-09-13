defmodule Lotta.Calendar.Calendar do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  alias Lotta.Calendar.CalendarEvent

  @type id() :: String.t()

  @type t() :: %__MODULE__{id: id(), name: :string, color: :string}

  @required_fields [:name]
  @optional_fields [:color, :is_publicly_available]

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime]

  schema "calendars" do
    field :name, :string
    field :color, :string, default: "#330000"
    field :is_publicly_available, :boolean, default: false

    has_many :events, CalendarEvent, on_replace: :delete

    timestamps()
  end

  @spec changeset(data :: map()) :: Ecto.Changeset.t(t())
  def changeset(data), do: changeset(%__MODULE__{}, data)

  @spec changeset(t(), data :: map()) :: Ecto.Changeset.t(t())
  def changeset(struct, data) do
    struct
    |> cast(data, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_format(:color, ~r/^#([A-Fa-f0-9]{6})$/)
  end
end
