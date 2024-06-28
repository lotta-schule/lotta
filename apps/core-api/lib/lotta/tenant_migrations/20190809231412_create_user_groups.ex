defmodule Lotta.Repo.TenantMigrations.CreateUserGroups do
  @moduledoc false

  use Ecto.Migration

  def change do
    create table(:user_groups) do
      add(:tenant_id, references(:tenants, on_delete: :nothing), null: false)
      add(:name, :string, null: false)
      add(:priority, :integer, null: false)
      add(:is_admin_group, :boolean, default: false)

      timestamps()
    end

    create(index(:user_groups, [:tenant_id]))
  end
end
