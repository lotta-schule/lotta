defmodule Api.Repo.Migrations.AddSortKeyToContentModule do
  use Ecto.Migration

  def change do
    alter table(:content_modules) do
      add :sort_key, :integer, default: 0
    end
  end
end
