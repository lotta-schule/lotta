defmodule Lotta.Calendar.CalendarEvent do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  alias Lotta.Calendar.Calendar

  @type id() :: String.t()

  @type t() :: %__MODULE__{
          id: id(),
          summary: String.t(),
          description: String.t() | nil,
          start: DateTime.t(),
          end: DateTime.t(),
          is_full_day: boolean(),
          recurrence_frequency: String.t() | nil,
          recurrence_interval: integer() | nil,
          recurrence_byday: [String.t()] | nil,
          recurrence_bymonthday: [integer()] | nil,
          recurrence_until: DateTime.t() | nil,
          recurrence_count: pos_integer() | nil
        }

  @required_fields [:calendar_id, :summary, :start]
  @optional_fields [
    :description,
    :end,
    :is_full_day,
    :timezone,
    :recurrence_frequency,
    :recurrence_interval,
    :recurrence_byday,
    :recurrence_bymonthday,
    :recurrence_until,
    :recurrence_count,
    :location_name
  ]

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime]

  schema "calendar_events" do
    field :summary, :string
    field :description, :string

    field :start, :utc_datetime
    field :end, :utc_datetime
    field :is_full_day, :boolean
    field :timezone, :string

    field :recurrence_frequency, :string
    field :recurrence_interval, :integer
    field :recurrence_byday, {:array, :string}
    field :recurrence_bymonthday, {:array, :integer}
    field :recurrence_until, :utc_datetime
    field :recurrence_count, :integer

    field :location_name, :string

    belongs_to :calendar, Calendar, type: :binary_id

    timestamps()
  end

  @spec changeset(data :: map()) :: Ecto.Changeset.t(t())
  @spec changeset(t(), data :: map()) :: Ecto.Changeset.t(t())
  def changeset(struct \\ %__MODULE__{}, data) do
    struct
    |> cast(data, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_frequency()
    |> put_timezone()
  end

  defp put_timezone(changeset) do
    with nil <- get_change(changeset, :timezone),
         %DateTime{time_zone: timezone} <- get_change(changeset, :start) do
      put_change(changeset, :timezone, timezone)
    else
      _ ->
        changeset
    end
  end

  defp validate_frequency(changeset) do
    case get_field(changeset, :recurrence_frequency) do
      nil ->
        changeset
        |> put_change(:recurrence_interval, nil)
        |> put_change(:recurrence_byday, nil)
        |> put_change(:recurrence_bymonthday, nil)
        |> put_change(:recurrence_until, nil)
        |> put_change(:recurrence_count, nil)

      _ ->
        changeset
        |> validate_required([:recurrence_interval])
    end
  end
end
