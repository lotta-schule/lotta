defmodule Lotta.Repo.TenantMigrations.ChangeArticlesCategoryReferenceToDeleteAll do
  @moduledoc false

  use Ecto.Migration

  def up do
    drop(constraint(:articles, "articles_category_id_fkey"))

    alter table(:articles) do
      modify(:category_id, references(:categories, on_delete: :delete_all))
    end
  end

  def down do
    drop(constraint(:articles, "articles_category_id_fkey"))

    alter table(:articles) do
      modify(:category_id, references(:categories, on_delete: :nothing))
    end
  end
end
