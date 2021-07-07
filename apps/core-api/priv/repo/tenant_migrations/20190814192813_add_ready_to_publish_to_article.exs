defmodule Lotta.Repo.TenantMigrations.AddReadyToPublishToArticle do
  use Ecto.Migration

  def change do
    alter table(:articles) do
      add(:ready_to_publish, :boolean, null: false, default: false)
    end
  end
end
