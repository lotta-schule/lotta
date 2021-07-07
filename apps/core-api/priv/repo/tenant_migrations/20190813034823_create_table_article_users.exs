defmodule Lotta.Repo.TenantMigrations.CreateTableArticleUsers do
  use Ecto.Migration

  def change do
    create table(:article_users, primary_key: false) do
      add(:article_id, references(:articles, on_delete: :delete_all), primary_key: true)
      add(:user_id, references(:users, on_delete: :delete_all), primary_key: true)
    end

    create(index(:article_users, [:article_id]))
    create(index(:article_users, [:user_id]))

    create(
      unique_index(:article_users, [:user_id, :article_id], name: :user_id_article_id_unique_index)
    )
  end
end
