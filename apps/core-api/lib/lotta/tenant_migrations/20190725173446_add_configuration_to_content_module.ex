defmodule Lotta.Repo.TenantMigrations.AddConfigurationToContentModule do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:content_modules) do
      add(:configuration, :json, default: "{}")
    end
  end
end
