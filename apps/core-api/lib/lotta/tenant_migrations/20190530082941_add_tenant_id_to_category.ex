defmodule Lotta.Repo.TenantMigrations.AddTenantIdToCategory do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:categories) do
      add(:tenant_id, references(:tenants, on_delete: :delete_all))
    end
  end
end
