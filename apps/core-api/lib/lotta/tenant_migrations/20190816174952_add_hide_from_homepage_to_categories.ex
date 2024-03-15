defmodule Lotta.Repo.TenantMigrations.AddHideFromHomepageToCategories do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:categories) do
      add(:hide_articles_from_homepage, :boolean, null: false, default: false)
    end
  end
end
