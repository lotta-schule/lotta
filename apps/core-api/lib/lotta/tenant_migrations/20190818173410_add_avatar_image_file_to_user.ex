defmodule Lotta.Repo.TenantMigrations.AddAvatarImageFileToUser do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:avatar_image_file_id, references(:files, on_delete: :nothing))
    end
  end
end
