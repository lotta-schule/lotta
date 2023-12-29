defmodule Lotta.Release do
  @moduledoc """
  Used for executing DB release tasks when run in production without Mix
  installed.
  """
  require Logger

  import Ecto.Query

  alias Lotta.Storage
  alias Lotta.Repo
  alias Lotta.Storage.{RemoteStorage, RemoteStorageEntity}
  alias Lotta.Tenants.{Tenant, TenantSelector}
  alias Ecto.Migrator

  @app :lotta

  def migrate do
    for repo <- repos() do
      Logger.notice("Migrating public schema ...")

      {:ok, _, _} =
        Migrator.with_repo(
          repo,
          &Migrator.run(&1, :up, all: true)
        )
    end

    on_each_tenant_repo(fn tenant, pid ->
      Logger.notice("Customer #{tenant.title} with schema #{tenant.prefix} is being migrated ...")

      TenantSelector.run_migrations(prefix: tenant.prefix, dynamic_repo: pid)
    end)
  end

  def drop do
    for repo <- repos() do
      {:ok, _, _} = Migrator.with_repo(repo, & &1.__adapter__.storage_down(&1.config))
    end
  end

  # example:
  # rollback
  def rollback(opts \\ [step: 1]) do
    on_each_tenant_repo(fn tenant, pid ->
      Logger.notice(
        "Customer #{tenant.title} with schema #{tenant.prefix} is being rolled back ..."
      )

      TenantSelector.rollback_migrations(
        Keyword.merge([prefix: tenant.prefix, dynamic_repo: pid], opts)
      )
    end)
  end

  def cleanup_storage do
    on_each_tenant_repo(fn tenant, _ ->
      Logger.notice(
        "Customer #{tenant.title} with schema #{tenant.prefix} is being cleaned up ..."
      )

      unused = Lotta.Storage.list_unused_remote_storage_entities(tenant.prefix)

      if Enum.empty?(unused) do
        Logger.notice("No unused remote storage entities found.")
      else
        Logger.notice("Unused remote storage entities found: #{Enum.count(unused)}")

        for entity <- unused do
          RemoteStorage.delete(entity)

          count =
            Repo.delete!(entity)
            |> Enum.count()

          Logger.notice("Deleted #{count} unused remote storage entities.")

          count
        end
      end

      Logger.notice(
        "Customer #{tenant.title} with schema #{tenant.prefix} has been cleaned up of unused RemoteStorageEntities."
      )

      :timer.sleep(2500)

      all_entities = Repo.all(RemoteStorageEntity, prefix: tenant.prefix)

      invalid_entities =
        Enum.reject(all_entities, fn entity ->
          RemoteStorage.exists?(entity) != false
        end)

      Logger.notice(
        "Invalid remote storage entities found: #{Enum.count(invalid_entities)} / #{Enum.count(all_entities)}"
      )

      deleted_entities =
        invalid_entities
        |> Enum.filter(fn entity ->
          Application.get_env(:lotta, :environment) == :production or
            entity.store_name == RemoteStorage.default_store()
        end)
        |> tap(fn entities ->
          Logger.notice(
            "Found #{Enum.count(entities)} invalid remote storage entities to delete ..."
          )
        end)
        |> Enum.map(fn entity ->
          Logger.notice("Deleting invalid remote storage entity #{inspect(entity)} ...")
          Repo.delete!(entity)
        end)

      Logger.notice(
        "#{Enum.count(deleted_entities)} invalid remote storage entities deleted in relevant storages."
      )

      cleaned_entities = unused ++ deleted_entities

      invalid_files =
        from(
          f in Storage.File,
          where: is_nil(f.remote_storage_entity_id)
        )
        |> Repo.all(prefix: tenant.prefix)

      deleted_files =
        invalid_files
        |> Enum.map(fn file ->
          Storage.delete_file(file)
        end)
        |> Enum.map(fn
          {:ok, file} ->
            file

          {:error, error} ->
            Logger.error("Error deleting file #{inspect(file)}: #{inspect(error)}")

            nil
        end)
        |> Enum.reject(&is_nil/1)

      Logger.notice("Files deleted: #{Enum.count(deleted_files)} / #{Enum.count(invalid_files)}")

      {deleted_file_conversion_count, _} =
        from(
          f in Storage.FileConversion,
          where: is_nil(f.remote_storage_entity_id)
        )
        |> Repo.delete_all(prefix: tenant.prefix)

      Logger.notice("#{deleted_file_conversion_count} invalid file conversions removed from db.")

      {String.to_atom(tenant.prefix), Enum.count(cleaned_entities), Enum.count(deleted_files),
       deleted_file_conversion_count}
    end)
  end

  def migrate_to_default_store do
    if Application.get_env(:lotta, :environment) != :production do
      raise "This task is only allowed in production"
    end

    if !RemoteStorage.default_store() do
      raise "Default store is not set"
    end

    default_store = RemoteStorage.default_store()

    on_each_tenant_repo(fn tenant, _ ->
      Logger.notice(
        "Customer #{tenant.title} with schema #{tenant.prefix} is being migrated to default store ..."
      )

      files_with_non_default_entities =
        from(
          f in Storage.File,
          join: e in assoc(f, :remote_storage_entity),
          where: e.store_name != ^default_store,
          preload: [:remote_storage_entity]
        )
        |> Repo.all(prefix: tenant.prefix)

      Logger.notice("Found #{Enum.count(files_with_non_default_entities)} files to migrate")

      Enum.each(files_with_non_default_entities, fn file ->
        Logger.notice("Migrating file #{inspect(file)}")

        Storage.copy_to_remote_storage(file, default_store)
      end)

      file_conversions_with_non_default_entities =
        from(
          f in Storage.FileConversion,
          join: e in assoc(f, :remote_storage_entity),
          where: e.store_name != ^RemoteStorage.default_store()
        )
        |> Repo.all(prefix: tenant.prefix)

      Enum.each(file_conversions_with_non_default_entities, fn file ->
        Logger.notice("Migrating file #{inspect(file)}")

        Storage.copy_to_remote_storage(file, default_store)
      end)

      Logger.notice(
        "Customer #{tenant.title} with schema #{tenant.prefix} has been migrated to default store."
      )

      {String.to_atom(tenant.prefix),
       Enum.count(files_with_non_default_entities) +
         Enum.count(file_conversions_with_non_default_entities)}
    end)
  end

  defp on_each_tenant_repo(fun) do
    Repo.with_new_dynamic_repo(fn pid ->
      customers = Repo.all(Tenant, prefix: "public", dynamic_repo: pid)

      Logger.notice(
        "Executing database operation on #{Enum.count(customers)} customer schemas ..."
      )

      for tenant <- customers do
        fun.(tenant, pid)
      end
    end)
  end

  defp repos, do: Application.fetch_env!(@app, :ecto_repos)
end
