defmodule Lotta.Repo.TenantMigrations.AddContentToContentModule do
  @moduledoc false

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
