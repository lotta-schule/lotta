defmodule Lotta.Repo.TenantMigrations.CreateCategories do
  use Ecto.Migration

  def change do
    create table(:categories) do
      add(:title, :string)
      add(:category_id, references(:categories, on_delete: :nothing))

      timestamps()
    end

    create(index(:categories, [:category_id]))
  end
end
