defmodule Lotta.Calendar.CalendarEvent do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  alias Lotta.Calendar.Calendar

  @type t() :: %__MODULE__{
          summary: String.t(),
          description: String.t() | nil,
          start: DateTime.t(),
          end: DateTime.t(),
          is_full_day: boolean(),
          repetition_rule: String.t()
        }

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
end
