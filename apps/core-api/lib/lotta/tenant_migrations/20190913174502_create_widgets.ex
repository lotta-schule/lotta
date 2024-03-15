defmodule Lotta.Repo.TenantMigrations.CreateWidgets do
  @moduledoc false

  use Ecto.Migration

  def change do
    create table(:widgets) do
      add(:title, :string)
      add(:type, :string)
      add(:configuration, :json, default: "{}")
      add(:group_id, references(:user_groups, on_delete: :nothing))

      timestamps()
    end

    create(index(:widgets, [:group_id]))
  end
end
