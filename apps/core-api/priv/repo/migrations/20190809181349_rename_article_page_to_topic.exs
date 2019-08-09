defmodule Api.Repo.Migrations.RenameArticlePageToTopic do
  use Ecto.Migration

  def change do
    rename table(:articles), :page_name, to: :topic
  end
end
