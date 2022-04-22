defmodule Lotta.Repo.TenantMigrations.MakeFileIdsUnique do
  use Ecto.Migration

  def change do
    create(unique_index(:file_conversions, :id))
    create(unique_index(:files, :id))
    create(unique_index(:directories, :id))
  end
end
