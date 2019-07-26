defmodule Api.Repo.Migrations.AddConfigurationToContentModule do
  use Ecto.Migration

  def change do
    alter table(:content_modules) do
      add :configuration, :json, default: "{}"
    end
  end
end
