defmodule Lotta.Repo.TenantMigrations.MoveEveryFuckingFileConversionToAnOrderlyLocation do
  @moduledoc false
  use Ecto.Migration

  import Ecto.Query

  alias Lotta.{Repo, Storage}
  alias Lotta.Storage.{FileConversion, RemoteStorageEntity, RemoteStorage}

  require Logger

  @disable_ddl_transaction true
  @disable_migration_lock true
  @batch_size 1000

  def up do
    all_conversions_to_migrate =
      from(fc in FileConversion,
        join: rse in RemoteStorageEntity,
        on: fc.remote_storage_entity_id == rse.id,
        select: {fc, rse}
      )
      |> Repo.all(max_rows: @batch_size, prefix: prefix())

    count = Enum.count(all_conversions_to_migrate)

    all_conversions_to_migrate
    |> Enum.with_index()
    |> Enum.each(fn {file_conversion, remote_storage_entity}, i ->
      Logger.warning(
        "(#{prefix()}): Processing file conversion (#{i + 1} / #{count}) #{file_conversion.id} with format #{file_conversion.format}"
      )

      migrate_named_format(file_conversion.format, {file_conversion, remote_storage_entity})
    end)
  end

  def down do
  end

  defp migrate_named_format("storyboard:1200px", format),
    do: migrate_format(format, "poster_1080p")

  defp migrate_named_format("mp4:" <> rest, format) when rest in ["480p", "720p", "1080p"],
    do: migrate_format(format, "videoplay_#{rest}-mp4")

  defp migrate_named_format("webm:" <> rest, format) when rest in ["480p", "720p", "1080p"],
    do: migrate_format(format, "videoplay_#{rest}-webm")

  defp migrate_named_format("aac", format), do: migrate_format(format, "audioplay_aac")

  defp migrate_named_format(named_format, format) do
    supported_categories = [
      "preview",
      "present",
      "avatar",
      "logo",
      "banner",
      "articlepreview",
      "pagebg",
      "icon",
      "poster",
      "videoplay",
      "audioplay"
    ]

    if Enum.any?(supported_categories, &String.starts_with?(named_format, &1)) do
      Logger.info("File format #{named_format} is already in the correct location.")
      :ok
    else
      Logger.warning("File format #{named_format} is no longer needed. It is being removed...")
      remove_format(format)
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
