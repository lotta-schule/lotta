defmodule Api.Repo.Migrations.AddIsPublicToFiles do
  use Ecto.Migration

  def change do
    alter table(:files) do
      add :is_public, :boolean, default: false
    end
  end
end
