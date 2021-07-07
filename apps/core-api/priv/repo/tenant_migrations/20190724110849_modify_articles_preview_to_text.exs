defmodule Lotta.Repo.TenantMigrations.ModifyArticlesPreviewToText do
  use Ecto.Migration

  def change do
    alter table(:articles) do
      modify(:preview, :text)
    end
  end
end
