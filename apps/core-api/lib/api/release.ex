defmodule Api.Release do
  @moduledoc """
    Release tasks like database migrations
  """
  require Logger

  import Ecto.Query

  alias Ecto.Migrator

  @app :api

  @elasticsearch_clusters [Api.Elasticsearch.Cluster]
  @elasticsearch_indexes [:articles]

  def migrate do
    for repo <- repos() do
      {:ok, _, _} =
        Migrator.with_repo(
          repo,
          &Migrator.run(&1, :up, all: true, prefix: database_prefix(repo))
        )
    end
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
        &Migrator.run(&1, :down, to: version, prefix: database_prefix(repo))
      )
  end

  def build_elasticsearch_indexes do
    Application.load(@app)
    IO.puts("Building indexes...")

    Enum.each(@elasticsearch_clusters, fn cluster ->
      Enum.each(
        @elasticsearch_indexes,
        &Elasticsearch.Index.hot_swap(cluster, cluster.get_prefixed_index(&1))
      )
    end)
  end

  def migrate_files_to_default_remote_storage() do
    store = Api.Storage.RemoteStorage.default_store()

    from(f in Api.Storage.File,
      join: rs in Api.Storage.RemoteStorageEntity,
      on: f.remote_storage_entity_id == rs.id,
      where: rs.store_name != ^store,
      preload: [:remote_storage_entity]
    )
    |> Api.Repo.all()
    |> Enum.chunk_every(10)
    |> Enum.each(fn files_chunk ->
      files_chunk
      |> Enum.each(fn file ->
        file
        |> Api.Storage.set_remote_storage(store)
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

  defp database_prefix(repo) do
    Application.fetch_env!(@app, repo)
    |> Keyword.get(:prefix)
  end

  defp repos do
    Application.load(@app)
    Application.fetch_env!(@app, :ecto_repos)
  end
end
