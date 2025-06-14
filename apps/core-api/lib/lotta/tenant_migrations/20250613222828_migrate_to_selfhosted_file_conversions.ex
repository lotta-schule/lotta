defmodule Lotta.Repo.TenantMigrations.MigrateToSelfhostedFileConversions do
  @moduledoc false

  use Ecto.Migration

  import Ecto.Query

  alias Lotta.{Repo, Storage}
  alias Lotta.Storage.{File, FileConversion, RemoteStorageEntity, RemoteStorage}

  require Logger

  def up do
    alter table(:file_conversions) do
      remove(:file_uuid, :uuid)
      remove(:remote_location, :string)
    end

    flush()

    from(fc in FileConversion,
      join: rse in RemoteStorageEntity,
      on: fc.remote_storage_entity_id == rse.id,
      select: {fc, rse}
    )
    |> Repo.stream(max_rows: 250, prefix: prefix())
    |> Stream.each(fn {file_conversion, remote_storage_entity} ->
      case file_conversion.format do
        "storyboard:1200px" ->
          migrate_format({file_conversion, remote_storage_entity}, "poster_1080p")

        "mp4:" <> rest when rest in ["480p", "720p", "1080p"] ->
          migrate_format({file_conversion, remote_storage_entity}, "videoplay_#{rest}-mp4")

        "webm:" <> rest when rest in ["480p", "720p", "1080p"] ->
          migrate_format({file_conversion, remote_storage_entity}, "videoplay_#{rest}-webm")

        "aac" ->
          migrate_format({file_conversion, remote_storage_entity}, "audioplay_aac")

        format ->
          Logger.warning("File format #{format} is no longer needed. It is being removed...")

          remove_format({file_conversion, remote_storage_entity})
      end
    end)
    |> Stream.run()

    flush()

    from(f in File,
      join: rse in RemoteStorageEntity,
      on: f.remote_storage_entity_id == rse.id,
      where: rse.store_name == ^RemoteStorage.default_store(),
      select: {f, rse}
    )
    |> Repo.stream(max_rows: 250, prefix: prefix())
    |> Stream.each(fn {file, remote_storage_entity} ->
      if remote_storage_entity.path != Storage.get_default_path(file) do
        Storage.copy_to_remote_storage(
          file,
          remote_storage_entity.store_name
        )
      end
    end)
  end

  def down do
    alter table(:file_conversions) do
      add(:file_uuid, :uuid, default: nil)
      add(:remote_location, :string, default: nil)
    end
  end

  defp migrate_format({file_conversion, remote_storage_entity}, to_format) do
    file_conversion
    |> Ecto.Changeset.change(%{format: to_format})
    |> Repo.update(prefix: prefix())

    if remote_storage_entity.store_name == RemoteStorage.default_store() and
         remote_storage_entity.path != Storage.get_default_path(file_conversion) do
      Storage.copy_to_remote_storage(
        file_conversion,
        remote_storage_entity.store_name
      )

      Logger.info(
        "Migrated file conversion #{file_conversion.id} to format #{to_format} in storage."
      )
    end
  end

  defp remove_format({file_conversion, remote_storage_entity}) do
    case Repo.delete(file_conversion, prefix: prefix()) do
      {:ok, _} ->
        Logger.info("Removed file conversion #{file_conversion.id} from the database.")
        Repo.delete(remote_storage_entity, prefix: prefix())
        Logger.info("Removed remote_storage_entity #{file_conversion.id} from the database.")

        if remote_storage_entity.store_name == RemoteStorage.default_store() do
          with {:ok, _} <- RemoteStorage.delete(remote_storage_entity) do
            Logger.info(
              "Removed file #{remote_storage_entity.store_name}:#{remote_storage_entity.path} from storage."
            )
          end
        end

      {:error, changeset} ->
        Logger.error("Failed to remove file conversion #{file_conversion.id}: #{changeset}")
    end
  end
end
