defmodule Lotta.Repo.TenantMigrations.ChangeArticleContentModulesReferenceToDeleteAll do
  use Ecto.Migration

  def up do
    drop(constraint(:content_modules, "content_modules_article_id_fkey"))

    alter table(:content_modules) do
      modify(:article_id, references(:articles, on_delete: :delete_all), null: false)
    end
  end

  def down do
    drop(constraint(:content_modules, "content_modules_article_id_fkey"))

    alter table(:content_modules) do
      modify(:article_id, references(:articles, on_delete: :nothing), null: false)
    end
  end
end
