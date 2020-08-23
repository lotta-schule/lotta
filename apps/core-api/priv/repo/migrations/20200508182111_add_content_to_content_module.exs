defmodule Api.Repo.Migrations.AddContentToContentModule do
  use Ecto.Migration

  def up do
    alter table(:content_modules) do
      add(:content, :jsonb, default: "{}")
    end
  end

  def down do
    alter table(:content_modules) do
      remove(:content)
    end
  end
end
