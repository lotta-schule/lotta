defmodule Lotta.Repo.TenantMigrations.MoveEveryFuckingFileConversionToAnOrderlyLocation do
  @moduledoc false

  @disable_ddl_transaction true
  @disable_migration_lock true
  @batch_size 1000

  use Ecto.Migration

  import Ecto.Query

  alias Lotta.{Repo, Storage}
  alias Lotta.Storage.{FileConversion, RemoteStorageEntity, RemoteStorage}

  require Logger

  def up do
    from(fc in FileConversion,
      join: rse in RemoteStorageEntity,
      on: fc.remote_storage_entity_id == rse.id,
      select: {fc, rse}
    )
    |> Repo.stream(max_rows: @batch_size, prefix: prefix())
    |> Stream.each(fn {file_conversion, remote_storage_entity} ->
      Logger.info(
        "(#{prefix()}): Processing file conversion #{file_conversion.id} with format #{file_conversion.format}"
      )

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
          if String.starts_with?(format, "poster_") ||
               String.starts_with?(format, "videoplay_") ||
               String.starts_with?(format, "preview_") ||
               String.starts_with?(format, "present_") ||
               String.starts_with?(format, "avatar_") ||
               String.starts_with?(format, "logo_") ||
               String.starts_with?(format, "banner_") ||
               String.starts_with?(format, "articlepreview_") ||
               String.starts_with?(format, "pagebg_") ||
               String.starts_with?(format, "icon_") do
            Logger.info("File format #{format} is already in the correct location.")
            :ok
          else
            Logger.warning("File format #{format} is no longer needed. It is being removed...")
            remove_format({file_conversion, remote_storage_entity})
          end
      end
    end)
    |> Stream.run()
  end

  def down do
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
