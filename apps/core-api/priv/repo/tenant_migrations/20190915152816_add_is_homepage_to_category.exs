defmodule Lotta.Repo.TenantMigrations.AddIsHomepageToCategory do
  use Ecto.Migration

  def change do
    alter table(:categories) do
      add(:is_homepage, :boolean, default: false)
    end
  end
end
