defmodule Lotta.Calendar.CalendarEvent do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  alias Ecto.Changeset
  alias Lotta.Calendar.Calendar

  @type id() :: String.t()

  @type t() :: %__MODULE__{
          id: id(),
          summary: String.t(),
          description: String.t() | nil,
          start: DateTime.t(),
          end: DateTime.t(),
          is_full_day: boolean(),
          repetition_rule: String.t()
        }

  @required_fields [:calendar_id, :summary, :start]
  @optional_fields [:description, :end, :is_full_day, :repetition_rule]

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime]

  schema "calendar_events" do
    field :summary, :string
    field :description, :string

    field :start, :utc_datetime
    field :end, :utc_datetime
    field :is_full_day, :boolean

    field :repetition_rule, :string

    field :location_name, :string

    belongs_to :calendar, Calendar, type: :binary_id

    timestamps()
  end

  @spec create_changeset(data :: map()) :: Ecto.Changeset.t(t())
  def create_changeset(data) do
    %__MODULE__{}
    |> cast(data, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_datetime()
  end

  defp validate_datetime(changeset) do
    start = get_change(changeset, :start)
    end_date = get_change(changeset, :end)

    changeset
  end
end
