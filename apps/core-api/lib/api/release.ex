defmodule Api.Release do
  @moduledoc """
    Release tasks like database migrations
  """
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
      :ok = Migrator.with_repo(repo, & &1.__adapter__.storage_down(&1.config))
    end
  end

  def rollback(repo, version) do
    {:ok, _, _} =
      Migrator.with_repo(
        repo,
        &Migrator.run(&1, :down, to: version, prefix: database_prefix(repo))
      )
  end

  def init_default_content() do
    Application.load(@app)

    unless Api.Repo.aggregate(Api.Accounts.User, :count, :id) > 0 do
      Api.System.DefaultContent.create_default_content()
    end
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

  defp database_prefix(repo) do
    Application.fetch_env!(@app, repo)
    |> Keyword.get(:prefix)
  end

  defp repos do
    Application.load(@app)
    Application.fetch_env!(@app, :ecto_repos)
  end
end
