defmodule Api.Repo.Migrations.UpdateUserModel do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :tenant_id, references(:tenants, on_delete: :nothing), null: false
      add :class, :string
    end
  end
end
