defmodule Lotta.Repo.TenantMigrations.ChangeArticlesPreviewImageFileOnDelete do
  @moduledoc false

  use Ecto.Migration

  def up do
    drop(constraint(:articles, "articles_preview_image_file_id_fkey"))

    alter table(:articles) do
      modify(:preview_image_file_id, references(:files, on_delete: :delete_all))
    end
  end

  def down do
    drop(constraint(:articles, "articles_preview_image_file_id_fkey"))

    alter table(:articles) do
      modify(:preview_image_file_id, references(:files, on_delete: :nothing))
    end
  end
end
