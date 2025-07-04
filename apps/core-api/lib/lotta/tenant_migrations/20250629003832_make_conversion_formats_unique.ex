defmodule Lotta.Repo.TenantMigrations.MakeConversionFormatsUnique do
  @moduledoc false

  use Ecto.Migration

  import Ecto.Query

  alias Lotta.Repo
  alias Lotta.Storage.{FileConversion, RemoteStorageEntity, RemoteStorage}

  require Logger

  def up do
    from(
      fc in FileConversion,
      where: is_nil(fc.remote_storage_entity_id)
    )
    |> Repo.delete_all(prefix: prefix())

    flush()

    # Delete duplicates
    from(
      fc in FileConversion,
      group_by: [fc.format, fc.file_id],
      having: count(fc.id) > 1,
      select: {fc.format, fc.file_id}
    )
    |> Repo.all(prefix: prefix())
    |> Enum.each(fn {format, file_id} ->
      keeper =
        from(fc in FileConversion,
          where: fc.format == ^format and fc.file_id == ^file_id,
          order_by: [asc: fc.inserted_at],
          limit: 1
        )
        |> Repo.all(prefix: prefix())
        |> List.first()

      from(
        fc in FileConversion,
        join: rse in RemoteStorageEntity,
        on: fc.remote_storage_entity_id == rse.id,
        where: fc.format == ^format and fc.file_id == ^file_id and fc.id != ^keeper.id,
        select: {fc, rse}
      )
      |> Repo.all(prefix: prefix())
      |> Enum.each(&remove_format/1)
    end)

    flush()

    from(
      fc in FileConversion,
      join: rse in RemoteStorageEntity,
      on: fc.remote_storage_entity_id == rse.id,
      where: fc.format == "videoplay_200p-webm" or fc.format == "videoplay_200p-mp4",
      select: {fc, rse}
    )
    |> Repo.all(prefix: prefix())
    |> Enum.each(&remove_format/1)

    flush()

    create(unique_index(:file_conversions, [:format, :file_id]))
  end

  def down do
    drop(unique_index(:file_conversions, [:format, :file_id]))
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
