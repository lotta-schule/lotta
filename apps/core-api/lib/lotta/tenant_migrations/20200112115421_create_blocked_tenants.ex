defmodule Lotta.Repo.TenantMigrations.CreateBlockedTenants do
  @moduledoc false

  use Ecto.Migration

  def change do
    create table(:blocked_tenants) do
      add(:user_id, references(:users, on_delete: :nothing))
      add(:tenant_id, references(:tenants, on_delete: :nothing))

      timestamps()
    end

    create(index(:blocked_tenants, [:user_id, :tenant_id]))
  end
end
