defmodule Lotta.Repo.Migrations.AddSearchToArticlesAndContentmodules do
  use Ecto.Migration

  alias Lotta.Repo

  def up do
    Repo.query!("""
      ALTER TABLE #{prefix()}.articles
      ADD COLUMN search tsvector
      GENERATED ALWAYS AS
        (
          setweight(to_tsvector('german', title), 'A') || ' ' ||
          setweight(to_tsvector('german', preview), 'B')
        )
      STORED
    """)
    Repo.query!("""
      ALTER TABLE #{prefix()}.content_modules
      ADD COLUMN search tsvector
      GENERATED ALWAYS AS
        (
          setweight(to_tsvector('german', text), 'B') || ' ' ||
          setweight(to_tsvector('german', content), 'B')
        )
      STORED
    """)

    create_if_not_exists index(:articles, :search, using: "GIN")
    create_if_not_exists index(:content_modules, :search, using: "GIN")
  end

  def down do
    drop index(:articles, :search)
    drop index(:content_modules, :search)

    alter table :articles do
      remove :search
    end
    alter table :content_modules do
      remove :search
    end
  end
end
