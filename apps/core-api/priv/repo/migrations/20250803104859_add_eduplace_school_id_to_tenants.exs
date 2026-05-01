defmodule Lotta.Repo.Migrations.AddEduplaceSchoolIdToTenants do
  use Ecto.Migration

  def change do
    alter table(:tenants) do
      add(:state, :string, null: false, default: "init")
      add(:address, :string, null: false, default: "")
      add(:type, :string, null: true)

      add(:eduplaces_id, :string, null: true, default: nil)
    end

    create(unique_index(:tenants, [:eduplaces_id], name: :unique_eduplaces_id))

    if direction() == :up do
      flush()

      repo().update_all(
        "tenants",
        set: [
          state: "active"
        ]
      )
    end
  end
end
