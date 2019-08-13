defmodule Api.Repo.Migrations.ChangeArticleUserToArticleUsers do
  use Ecto.Migration

  def change do
    alter table(:articles) do
      remove :user_id
    end
  end
end
