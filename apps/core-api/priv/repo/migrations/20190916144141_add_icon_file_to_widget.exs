defmodule Api.Repo.Migrations.AddIconFileToWidget do
  use Ecto.Migration

  def change do
    alter table(:widgets) do
      add :icon_image_file_id, references(:files, on_delete: :nothing)
    end

    create index(:widgets, [:icon_image_file_id])
  end
end
