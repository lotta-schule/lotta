defmodule Lotta.Repo.Migrations.CreateTenants do
  use Ecto.Migration

  def change do
    create table(:tenants) do
      add(:title, :string)
      add(:slug, :string)
      add(:prefix, :string)

      timestamps()
    end

    create(unique_index(:tenants, :slug))
  end
end
