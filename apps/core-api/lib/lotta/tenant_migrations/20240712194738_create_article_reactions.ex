defmodule Lotta.Repo.TenantMigrations.CreateArticleReactions do
  @moduledoc false

  use Ecto.Migration

  def change do
    create table(:article_reactions) do
      add(:article_id, references(:articles, on_delete: :delete_all))
      add(:user_id, references(:users, on_delete: :delete_all))
      add(:type, :string)

      timestamps()
    end

    create(index(:article_reactions, [:article_id]))
    create(index(:article_reactions, [:user_id]))
    create(index(:article_reactions, [:article_id, :user_id]))
  end
end
