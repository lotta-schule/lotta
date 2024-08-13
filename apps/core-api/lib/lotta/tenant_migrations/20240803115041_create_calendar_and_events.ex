defmodule Lotta.Repo.TenantMigrations.CreateCalendarAndEvents do
  use Ecto.Migration

  def change do
    create table(:calendars, primary_key: [name: :id, type: :binary_id]) do
      add :name, :string
      add :default_color, :string, null: true

      timestamps()
    end

    create index(:calendars, :name)

    create table(:calendar_events, primary_key: [name: :id, type: :binary_id]) do
      add :summary, :string
      add :description, :text

      add :start, :utc_datetime
      add :end, :utc_datetime
      add :is_full_day, :boolean

      add :repetition_rule, :string

      add :location_name, :string

      add :calendar_id, references("calendars", type: :binary_id)

      timestamps()
    end
  end
end
