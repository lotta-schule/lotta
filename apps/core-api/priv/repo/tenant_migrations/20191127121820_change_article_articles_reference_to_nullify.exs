defmodule Lotta.Repo.TenantMigrations.ChangeArticleArticlesReferenceToNullify do
  use Ecto.Migration

  def up do
    drop(constraint(:categories, "categories_category_id_fkey"))

    alter table(:categories) do
      modify(:category_id, references(:categories, on_delete: :nilify_all))
    end
  end

  def down do
    drop(constraint(:categories, "categories_category_id_fkey"))

    alter table(:categories) do
      modify(:category_id, references(:categories, on_delete: :nothing))
    end
  end
end
