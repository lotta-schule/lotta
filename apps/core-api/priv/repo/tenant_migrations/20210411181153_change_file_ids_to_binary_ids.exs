defmodule Lotta.Repo.TenantMigrations.ChangeFileIdsToBinaryIds do
  use Ecto.Migration

  alias Lotta.Repo

  def up do
    drop(table(:tenants))

    Repo.query!("
      CREATE EXTENSION IF NOT EXISTS pgcrypto CASCADE;
    ")

    flush()

    alter table(:file_conversions) do
      add(:uuid, :uuid, null: false, default: fragment("public.gen_random_uuid()"))
      add(:file_uuid, :uuid)
    end

    alter table(:files) do
      add(:uuid, :uuid, null: false, default: fragment("public.gen_random_uuid()"))
      add(:parent_directory_uuid, :uuid)
    end

    alter table(:directories) do
      add(:uuid, :uuid, null: false, default: fragment("public.gen_random_uuid()"))
      add(:parent_directory_uuid, :uuid)
    end

    alter table(:users) do
      add(:avatar_image_file_uuid, :uuid)
    end

    alter table(:categories) do
      add(:banner_image_file_uuid, :uuid)
    end

    alter table(:widgets) do
      add(:icon_image_file_uuid, :uuid)
    end

    alter table(:articles) do
      add(:preview_image_file_uuid, :uuid)
    end

    alter table(:content_module_file) do
      add(:file_uuid, :uuid)
    end

    alter table(:configuration) do
      add(:file_value_uuid, :uuid)
    end

    flush()

    Repo.query!(
      "UPDATE #{prefix()}.file_conversions SET file_uuid=files.uuid FROM #{prefix()}.files WHERE file_conversions.file_id=files.id;"
    )

    Repo.query!(
      "UPDATE #{prefix()}.files SET parent_directory_uuid=directories.uuid FROM #{prefix()}.directories WHERE files.parent_directory_id=directories.id;"
    )

    Repo.query!(
      "UPDATE #{prefix()}.directories SET parent_directory_uuid=parent_directories.uuid FROM #{prefix()}.directories as parent_directories WHERE directories.parent_directory_id=parent_directories.id;"
    )

    Repo.query!(
      "UPDATE #{prefix()}.users SET avatar_image_file_uuid=files.uuid FROM #{prefix()}.files WHERE users.avatar_image_file_id=files.id;"
    )

    Repo.query!(
      "UPDATE #{prefix()}.categories SET banner_image_file_uuid=files.uuid FROM #{prefix()}.files WHERE categories.banner_image_file_id=files.id;"
    )

    Repo.query!(
      "UPDATE #{prefix()}.widgets SET icon_image_file_uuid=files.uuid FROM #{prefix()}.files WHERE widgets.icon_image_file_id=files.id;"
    )

    Repo.query!(
      "UPDATE #{prefix()}.articles SET preview_image_file_uuid=files.uuid FROM #{prefix()}.files WHERE articles.preview_image_file_id=files.id;"
    )

    Repo.query!(
      "UPDATE #{prefix()}.content_module_file SET file_uuid=files.uuid FROM #{prefix()}.files WHERE content_module_file.file_id=files.id;"
    )

    Repo.query!(
      "UPDATE #{prefix()}.configuration SET file_value_uuid=files.uuid FROM #{prefix()}.files WHERE configuration.file_value_id=files.id;"
    )

    drop(constraint(:users, "users_avatar_image_file_id_fkey"))
    drop(constraint(:categories, "categories_banner_image_file_id_fkey"))
    drop(constraint(:widgets, "widgets_icon_image_file_id_fkey"))
    drop(constraint(:articles, "articles_preview_image_file_id_fkey"))
    drop(constraint(:file_conversions, "file_conversions_file_id_fkey"))
    drop(constraint(:files, "files_parent_directory_id_fkey"))
    drop(constraint(:directories, "directories_parent_directory_id_fkey"))
    drop(constraint(:content_module_file, "content_module_file_file_id_fkey"))
    drop(constraint(:configuration, "configuration_file_value_id_fkey"))

    flush()

    alter table(:content_module_file) do
      remove(:file_id)
    end

    alter table(:configuration) do
      remove(:file_value_id)
    end

    alter table(:users) do
      remove(:avatar_image_file_id)
    end

    alter table(:categories) do
      remove(:banner_image_file_id)
    end

    alter table(:widgets) do
      remove(:icon_image_file_id)
    end

    alter table(:articles) do
      remove(:preview_image_file_id)
    end

    alter table(:file_conversions) do
      remove(:id)
      remove(:file_id)
    end

    alter table(:files) do
      remove(:id)
      remove(:parent_directory_id)
    end

    alter table(:directories) do
      remove(:id)
      remove(:parent_directory_id)
    end

    flush()

    rename(table(:file_conversions), :uuid, to: :id)
    rename(table(:file_conversions), :file_uuid, to: :file_id)

    rename(table(:files), :uuid, to: :id)
    rename(table(:files), :parent_directory_uuid, to: :parent_directory_id)

    rename(table(:directories), :uuid, to: :id)
    rename(table(:directories), :parent_directory_uuid, to: :parent_directory_id)

    rename(table(:users), :avatar_image_file_uuid, to: :avatar_image_file_id)

    rename(table(:categories), :banner_image_file_uuid, to: :banner_image_file_id)

    rename(table(:widgets), :icon_image_file_uuid, to: :icon_image_file_id)

    rename(table(:articles), :preview_image_file_uuid, to: :preview_image_file_id)

    rename(table(:content_module_file), :file_uuid, to: :file_id)

    rename(table(:configuration), :file_value_uuid, to: :file_value_id)

    flush()

    Repo.query!("ALTER TABLE #{prefix()}.files ADD PRIMARY KEY (id)")
    Repo.query!("ALTER TABLE #{prefix()}.directories ADD PRIMARY KEY (id)")

    flush()

    alter table(:file_conversions) do
      add(:file_uuid, references(:files, type: :uuid, on_delete: :delete_all))
    end

    alter table(:files) do
      modify(:parent_directory_id, references(:directories, type: :uuid, on_delete: :nilify_all))
    end

    alter table(:directories) do
      modify(:parent_directory_id, references(:directories, type: :uuid, on_delete: :nilify_all))
    end

    alter table(:users) do
      modify(:avatar_image_file_id, references(:files, type: :uuid, on_delete: :nilify_all))
    end

    alter table(:categories) do
      modify(:banner_image_file_id, references(:files, type: :uuid, on_delete: :nilify_all))
    end

    alter table(:widgets) do
      modify(:icon_image_file_id, references(:files, type: :uuid, on_delete: :nilify_all))
    end

    alter table(:articles) do
      modify(:preview_image_file_id, references(:files, type: :uuid, on_delete: :nilify_all))
    end

    alter table(:content_module_file) do
      modify(:file_id, references(:files, type: :uuid, on_delete: :nilify_all))
    end

    alter table(:configuration) do
      modify(:file_value_id, references(:files, type: :uuid, on_delete: :nilify_all))
    end
  end
end
