defmodule Lotta.Repo.TenantMigrations.ChangeArticlesCategoryOnDelete do
  @moduledoc false

  use Ecto.Migration

  def up do
    drop(constraint(:articles, "articles_category_id_fkey"))

    alter table(:articles) do
      modify(:category_id, references(:categories, on_delete: :nilify_all))
    end
  end

  def down do
    drop(constraint(:articles, "articles_category_id_fkey"))

    alter table(:articles) do
      modify(:category_id, references(:categories, on_delete: :delete_all))
    end
  end
end
