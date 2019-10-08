defmodule Api.Repo.Migrations.AddIsPinnedToTopToArticle do
  use Ecto.Migration

  def change do
    alter table(:articles) do
      add :is_pinned_to_top, :boolean, null: false, default: false
    end
  end
end
