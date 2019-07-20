defmodule Api.Repo.Migrations.AddPreviewAndBannerToArticles do
  use Ecto.Migration

  def change do
    alter table(:articles) do
      remove :preview_image_url

      add :preview_image_file_id, references(:files, on_delete: :nothing)
    end

    create index(:articles, [:preview_image_file_id])
  end
end
