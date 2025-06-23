defmodule Lotta.Release do
  @moduledoc """
  Used for executing DB release tasks when run in production without Mix
  installed.
  """
  require Logger

  import Ecto.Query

  alias Lotta.Storage
  alias Lotta.Repo
  alias Lotta.Storage.RemoteStorage
  alias Lotta.Tenants.{Tenant, TenantDbManager}
  alias Lotta.{Accounts, Content, Storage}
  alias Ecto.Migrator

  def migrate do
    start_app()

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

      TenantDbManager.run_migrations(prefix: tenant.prefix, dynamic_repo: pid)
    end)
  end

  def drop do
    start_app()

    for repo <- repos() do
      {:ok, _, _} = Migrator.with_repo(repo, & &1.__adapter__.storage_down(&1.config))
    end
  end

  def rollback(opts \\ [step: 1]) do
    start_app()

    on_each_tenant_repo(fn tenant, pid ->
      Logger.notice(
        "Customer #{tenant.title} with schema #{tenant.prefix} is being rolled back ..."
      )

      TenantDbManager.rollback_migrations(
        Keyword.merge([prefix: tenant.prefix, dynamic_repo: pid], opts)
      )
    end)
  end

  def cleanup_storage do
    start_app()

    on_each_tenant_repo(fn tenant, _ ->
      Logger.notice(
        "Customer #{tenant.title} with schema #{tenant.prefix} is being cleaned up ..."
      )

      unused = remove_unused_storage_entities(tenant)

      Logger.notice("Unused remote storage entities deleted: #{Enum.count(unused)}")
    end)
  end

  def migrate_to_default_store do
    if Application.get_env(:lotta, :environment) != :production do
      raise "This task is only allowed in production"
    end

    on_each_tenant_repo(&migrate_to_default_store(&1))
  end

  def migrate_to_default_store(tenant) do
    start_app()

    default_store = RemoteStorage.default_store()

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
  end

  def remove_unused_storage_entities(tenant) do
    start_app()

    unused = Lotta.Storage.list_unused_remote_storage_entities(tenant.prefix)

    if Enum.empty?(unused) do
      Logger.notice("No unused remote storage entities found.")
    else
      Logger.notice("Unused remote storage entities found: #{Enum.count(unused)}")

      for entity <- unused do
        RemoteStorage.delete(entity)

        Repo.delete!(entity)
      end

      count = Enum.count(unused)

      Logger.notice("Deleted #{count} unused remote storage entities.")

      count
    end

    Logger.notice(
      "Customer #{tenant.title} with schema #{tenant.prefix} has been cleaned up of unused RemoteStorageEntities."
    )

    unused
  end

  def convert_existing_media do
    start_app()

    on_each_tenant_repo(fn tenant, _ ->
      Logger.notice(
        "Customer #{tenant.title} with schema #{tenant.prefix} is being converted ..."
      )

      convert_existing_media(tenant)
    end)
  end

  defp convert_existing_media(%Tenant{} = tenant) do
    start_app()

    Logger.notice("Converting existing media for tenant #{tenant.prefix} ...")

    # Create previews
    Repo.all(Storage.File, prefix: tenant.prefix)
    |> ensure_formats(:preview_200)

    Content.Article
    |> Repo.all(prefix: tenant.prefix)
    |> Repo.preload(:preview_image_file)
    |> Enum.map(& &1.preview_image_file)
    |> Enum.reject(&is_nil/1)
    |> tap(fn files ->
      Logger.notice("Converting #{Enum.count(files)} article preview images ...")
    end)
    |> ensure_formats(:articlepreview_330)

    Accounts.User
    |> Repo.all(prefix: tenant.prefix)
    |> Repo.preload(:avatar_image_file)
    |> Enum.map(& &1.avatar_image_file)
    |> Enum.reject(&is_nil/1)
    |> tap(fn files ->
      Logger.notice("Converting #{Enum.count(files)} article preview images ...")
    end)
    |> ensure_formats(:avatar_50)

    Content.ContentModule
    |> Repo.all(prefix: tenant.prefix)
    |> Repo.preload(:files)
    |> Enum.group_by(& &1.type)
    |> Enum.map(fn
      {type, modules} when type in ["image", "image_collection", "text"] ->
        Logger.notice("converting #{Enum.count(modules)} #{type} content modules ...")

        modules
        |> Enum.flat_map(& &1.files)
        |> ensure_formats(:present_1200)

      {"video", modules} ->
        Logger.notice("converting #{Enum.count(modules)} video content modules ...")

        [:"videoplay_200p-webm", :poster_1080p]
        |> Enum.each(fn format ->
          modules
          |> Enum.flat_map(& &1.files)
          |> ensure_formats(format)
        end)

      {"audio", modules} ->
        Logger.notice("converting #{Enum.count(modules)} audio content modules ...")

        modules
        |> Enum.flat_map(& &1.files)
        |> ensure_formats(:audioplay_aac)

      {type, modules} ->
        Logger.notice("No conversion for #{Enum.count(modules)} #{type} content modules ...")
    end)
  end

  defp ensure_formats(files, format),
    do: Enum.map(files, &Lotta.Worker.Conversion.get_or_create_conversion_job(&1, format))

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

  defp repos, do: Application.fetch_env!(:lotta, :ecto_repos)

  defp start_app(), do: Application.ensure_all_started(:lotta)
end
