defmodule Lotta.Repo.TenantMigrations.NowMoveFiles do
  @moduledoc false

  @disable_ddl_transaction true
  @disable_migration_lock true
  @batch_size 500

  use Ecto.Migration

  import Ecto.Query

  alias Lotta.{Repo, Storage}
  alias Lotta.Storage.{File, RemoteStorage, RemoteStorageEntity}

  require Logger

  def up do
    from(f in File,
      join: rse in RemoteStorageEntity,
      on: f.remote_storage_entity_id == rse.id,
      where: rse.store_name == ^RemoteStorage.default_store(),
      select: {f, rse}
    )
    |> Repo.stream(max_rows: @batch_size, prefix: prefix())
    |> Stream.each(fn {file, remote_storage_entity} ->
      if remote_storage_entity.path != Storage.get_default_path(file) do
        Storage.copy_to_remote_storage(
          file,
          remote_storage_entity.store_name
        )
      end
    end)
    |> Stream.run()
  end

  def down do
  end
end
