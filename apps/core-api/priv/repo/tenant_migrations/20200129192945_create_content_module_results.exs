defmodule Lotta.Repo.TenantMigrations.CreateContentModuleResults do
  use Ecto.Migration

  def change do
    create table(:content_module_results) do
      add(:content_module_id, references(:content_modules, on_delete: :delete_all))
      add(:user_id, references(:users, on_delete: :nilify_all))
      add(:result, :json, default: "{}")

      timestamps()
    end

    create(index(:content_module_results, [:content_module_id]))
    create(index(:content_module_results, [:user_id]))
  end
end
