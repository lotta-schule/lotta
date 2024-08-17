defmodule Lotta.Calendar.Calendar do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  alias Lotta.Calendar.CalendarEvent

  @type id() :: String.t()

  @type t() :: %__MODULE__{id: id(), name: :string, default_color: :string | nil}

  @primary_key {:id, :binary_id, autogenerate: true}
  @timestamps_opts [type: :utc_datetime]

  schema "calendars" do
    field :name, :string
    field :default_color, :string

    has_many :events, CalendarEvent, on_replace: :delete

    timestamps()
  end

  @spec create_changeset(data :: map()) :: Ecto.Changeset.t(t())
  def create_changeset(data) do
    %__MODULE__{}
    |> cast(data, [:name, :default_color])
    |> validate_required(:name)
    |> validate_format(:default_color, ~r/^#([A-Fa-f0-9]{6})$/)
  end
end
