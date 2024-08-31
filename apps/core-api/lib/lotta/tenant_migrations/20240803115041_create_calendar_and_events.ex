defmodule Lotta.Repo.TenantMigrations.CreateCalendarAndEvents do
  @moduledoc false

  use Ecto.Migration

  def change do
    create table(:calendars, primary_key: [name: :id, type: :binary_id]) do
      add :name, :string
      add :color, :string, null: false, default: "#330000"

      add :is_publicly_available, :boolean, null: false, default: false

      timestamps()
    end

    create index(:calendars, :name)

    create table(:calendar_events, primary_key: [name: :id, type: :binary_id]) do
      add :summary, :string
      add :description, :text

      add :start, :timestamptz
      add :end, :timestamptz
      add :is_full_day, :boolean

      add :location_name, :string

      add :recurrence_frequency, :string
      add :recurrence_interval, :integer
      add :recurrence_byday, {:array, :string}
      add :recurrence_bymonthday, {:array, :integer}
      add :recurrence_until, :timestamptz
      add :recurrence_count, :integer

      add :calendar_id, references("calendars", type: :binary_id),
        null: false,
        on_delete: :delete_all

      timestamps()
    end

    create index(:calendar_events, [:calendar_id, :start])
    create index(:calendar_events, [:calendar_id, :end])
    create index(:calendar_events, [:recurrence_frequency])
    create index(:calendar_events, [:recurrence_frequency, :recurrence_until])
  end
end
