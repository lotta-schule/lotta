defmodule Api.Repo.Migrations.AddTenantToWidget do
  use Ecto.Migration

  def change do
    alter table(:widgets) do
      add :tenant_id, references(:tenants, on_delete: :delete_all)
    end

    create index(:widgets, [:tenant_id])
  end
end
