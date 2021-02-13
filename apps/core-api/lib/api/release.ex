defmodule Api.Release do
  @moduledoc """
    Release tasks like database migrations
  """
  alias Ecto.Migrator
  import Ecto.Query

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

  def check_unavailable_files do
    Application.ensure_all_started(@app)

    Api.Repo.all(from(f in Api.Accounts.File, select: [f.id, f.remote_location]))
    |> Enum.each(fn [id, remote_location] ->
      case HTTPoison.head(remote_location) do
        {:ok, %{status_code: 200}} ->
          # IO.inspect(headers)
          nil

        {:ok, %{status_code: status_code}} ->
          IO.inspect("Status Code #{status_code} getting file ##{id} #{remote_location}")
          nil

        {:error, reason} ->
          IO.inspect("error getting file ##{id} #{remote_location}: #{inspect(reason)}")
          nil
      end

      :timer.sleep(100)
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
