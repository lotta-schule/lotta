defmodule Lotta.Repo.TenantMigrations.ChangeFilesAndDirectoriesToOnDelete do
  use Ecto.Migration

  def up do
    # delete files when owning user or corresponding tenant is deleted
    drop(constraint(:files, "files_user_id_fkey"))
    drop(constraint(:files, "files_tenant_id_fkey"))

    alter table(:files) do
      modify(:user_id, references(:users, on_delete: :delete_all))
      modify(:tenant_id, references(:tenants, on_delete: :delete_all))
    end

    # delete files conversions when original file has been deleted
    drop(constraint(:file_conversions, "file_conversions_file_id_fkey"))

    alter table(:file_conversions) do
      modify(:file_id, references(:files, on_delete: :delete_all))
    end

    # delete directories when owning user or corresponding tenant is deleted
    drop(constraint(:directories, "directories_user_id_fkey"))
    drop(constraint(:directories, "directories_tenant_id_fkey"))

    alter table(:directories) do
      modify(:user_id, references(:users, on_delete: :delete_all))
      modify(:tenant_id, references(:tenants, on_delete: :delete_all))
    end
  end

  def down do
    drop(constraint(:files, "files_user_id_fkey"))
    drop(constraint(:files, "files_tenant_id_fkey"))

    alter table(:files) do
      modify(:user_id, references(:users, on_delete: :nothing))
      modify(:tenant_id, references(:tenants, on_delete: :nothing))
    end

    drop(constraint(:file_conversions, "file_conversions_file_id_fkey"))

    alter table(:file_conversions) do
      modify(:file_id, references(:files, on_delete: :nothing))
    end

    drop(constraint(:directories, "directories_user_id_fkey"))
    drop(constraint(:directories, "directories_tenant_id_fkey"))

    alter table(:directories) do
      modify(:user_id, references(:users, on_delete: :nothing))
      modify(:tenant_id, references(:tenants, on_delete: :nothing))
    end
  end
end
