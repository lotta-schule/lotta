defmodule Lotta.Repo.TenantMigrations.CreateFiles do
  @moduledoc false

  use Ecto.Migration

  def change do
    create table(:files) do
      add(:path, :string)
      add(:filename, :string)
      add(:filesize, :integer)
      add(:remote_location, :string)
      add(:mime_type, :string)
      add(:file_type, :string)
      add(:user_id, references(:users, on_delete: :nothing))
      add(:tenant_id, references(:users, on_delete: :nothing))

      timestamps()
    end

    create(index(:files, [:user_id, :tenant_id]))
  end
end
