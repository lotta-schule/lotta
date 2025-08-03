defmodule Lotta.Repo.Migrations.AddEduplaceSchoolIdToTenants do
  use Ecto.Migration

  def change do
    alter table(:tenants) do
      add(:address, :string, null: false, default: "")
      add(:type, :string, null: true)

      add(:eduplaces_school_id, :string, null: true, default: nil)
    end
  end
end
