defmodule Lotta.Repo.TenantMigrations.CreateFileConversions do
  use Ecto.Migration

  def change do
    create table(:file_conversions) do
      add(:format, :string)
      add(:remote_location, :string)
      add(:mime_type, :string)
      add(:file_type, :string)
      add(:file_id, references(:files, on_delete: :nothing))

      timestamps()
    end

    create(index(:file_conversions, [:file_id]))
  end
end
