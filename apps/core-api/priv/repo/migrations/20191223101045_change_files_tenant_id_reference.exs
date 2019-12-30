defmodule Api.Repo.Migrations.ChangeFilesTenantIdReference do
  use Ecto.Migration

  def up do
    drop(constraint(:files, "files_tenant_id_fkey"))

    alter table(:files) do
      modify(:tenant_id, references(:tenants, on_delete: :nothing), null: false)
    end
  end

  def down do
    drop(constraint(:files, "files_tenant_id_fkey"))

    alter table(:files) do
      modify(:tenant_id, references(:tenants, on_delete: :delete_all), null: false)
    end
  end
end
