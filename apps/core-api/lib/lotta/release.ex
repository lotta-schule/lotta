defmodule Lotta.Release do
  @moduledoc """
    Release tasks like database migrations
  """
  require Logger

  import Ecto.Query

  alias Ecto.Migrator

  @app :lotta

  @elasticsearch_clusters [Lotta.Elasticsearch.Cluster]
  @elasticsearch_indexes [:articles]

  def migrate do
    Application.load(@app)

    for repo <- repos() do
      {:ok, _, _} =
        Migrator.with_repo(
          repo,
          &Migrator.run(&1, :up, all: true)
        )
    end

    Enum.map(
      Lotta.Tenants.list_tenants(),
      fn tenant ->
        Lotta.Tenants.TenantSelector.run_migrations(prefix: tenant.prefix)
      end
    )
  end

  def drop do
    for repo <- repos() do
      {:ok, _, _} = Migrator.with_repo(repo, & &1.__adapter__.storage_down(&1.config))
    end
  end

  def rollback(repo, version) do
    {:ok, _, _} =
      Migrator.with_repo(
        repo,
        &Migrator.run(&1, :down, to: version)
      )
  end

  def build_elasticsearch_indexes do
    Application.load(@app)
    IO.puts("Building indexes...")

    Enum.each(@elasticsearch_clusters, fn cluster ->
      Enum.each(
        @elasticsearch_indexes,
        &Elasticsearch.Index.hot_swap(cluster, &1)
      )
    end)
  end

  def migrate_files_to_default_remote_storage() do
    migrate_filelikes_in_chunks(Api.Storage.File)
    migrate_filelikes_in_chunks(Api.Storage.FileConversion)
  end

  defp migrate_filelikes_in_chunks(module) do
    store = Lotta.Storage.RemoteStorage.default_store()

    from(f in module,
      join: rs in Api.Storage.RemoteStorageEntity,
      on: f.remote_storage_entity_id == rs.id,
      where: rs.store_name != ^store,
      preload: [:remote_storage_entity]
    )
    |> Lotta.Repo.all()
    |> Enum.chunk_every(10)
    |> Enum.each(fn files_chunk ->
      files_chunk
      |> Enum.each(fn file ->
        file
        |> Lotta.Storage.set_remote_storage(store)
        |> case do
          {:error, error} ->
            Logger.error("#{error}: Error migrating file #{file.id} to #{store}")

          _ ->
            {:ok, file}
        end
      end)

      :timer.sleep(250)
    end)
  end

  defp repos do
    Application.load(@app)
    Application.fetch_env!(@app, :ecto_repos)
  end
end
