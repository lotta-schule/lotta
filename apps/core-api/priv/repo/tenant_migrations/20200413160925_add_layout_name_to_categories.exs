defmodule Lotta.Repo.TenantMigrations.AddLayoutNameToCategories do
  use Ecto.Migration

  def change do
    alter table(:categories) do
      add(:layout_name, :string)
    end
  end
end
