defmodule Api.Repo.Migrations.ChangeUsersAvatarImageFileReference do
  use Ecto.Migration

  def up do
    drop(constraint(:users, "users_avatar_image_file_id_fkey"))

    alter table(:users) do
      modify(:avatar_image_file_id, references(:files, on_delete: :nilify_all))
    end
  end

  def down do
    drop(constraint(:users, "users_avatar_image_file_id_fkey"))

    alter table(:users) do
      modify(:avatar_image_file_id, references(:files, on_delete: :nothing))
    end
  end
end
