defmodule Api.Repo.Migrations.CreateContentModules do
  use Ecto.Migration

  def change do
    create table(:content_modules) do
      add :type, :string
      add :text, :text
      add :article_id, references(:articles)

      timestamps()
    end

    create index(:content_modules, [:article_id])

  end
end
