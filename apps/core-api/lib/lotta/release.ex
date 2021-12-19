defmodule Lotta.Release do
  @moduledoc """
    Release tasks like database migrations
  """
  require Logger

  alias Lotta.Repo
  alias Lotta.Tenants.{Tenant, TenantSelector}
  alias Lotta.Elasticsearch.Cluster
  alias Elasticsearch.Index
  alias Ecto.Migrator

  @app :lotta

  @elasticsearch_clusters [Cluster]
  @elasticsearch_indexes [:articles]

  def migrate do
    for repo <- repos() do
      {:ok, _, _} =
        Migrator.with_repo(
          repo,
          &Migrator.run(&1, :up, all: true)
        )
    end

    config =
      Application.get_env(:lotta, Repo)
      |> Keyword.put(:name, nil)
      |> Keyword.put(:pool_size, 2)
      |> Keyword.delete(:pool)

    {:ok, pid} = Repo.start_link(config)
    Repo.put_dynamic_repo(pid)

    Enum.each(
      Repo.all(Tenant, prefix: "public"),
      fn tenant ->
        TenantSelector.run_migrations(prefix: tenant.prefix, dynamic_repo: pid)
      end
    )

    Repo.stop(1000)
    Repo.put_dynamic_repo(Repo)
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
        &Index.hot_swap(cluster, &1)
      )
    end)
  end

  defp repos do
    Application.load(@app)
    Application.fetch_env!(@app, :ecto_repos)
  end
end
