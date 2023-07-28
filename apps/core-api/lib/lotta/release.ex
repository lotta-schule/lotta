defmodule Lotta.Release do
  @moduledoc """
  Used for executing DB release tasks when run in production without Mix
  installed.
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
      Logger.notice("Migrating public schema ...")

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

    customers = Repo.all(Tenant, prefix: "public")
    Logger.notice("Migrating #{Enum.count(customers)} customer schemas ...")

    Enum.each(
      customers,
      fn tenant ->
        Logger.notice(
          "Customer #{tenant.title} with schema #{tenant.prefix} is being migrated ..."
        )

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
    load_app()

    Logger.info("Building search indexes...")

    Enum.each(@elasticsearch_clusters, fn cluster ->
      Enum.each(
        @elasticsearch_indexes,
        &Index.hot_swap(cluster, &1)
      )
    end)
  end

  defp repos, do: Application.fetch_env!(@app, :ecto_repos)

  defp load_app do
    Application.load(@app)
  end
end
