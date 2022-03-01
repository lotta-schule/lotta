defmodule Lotta.Tenants.TenantSelector do
  @moduledoc """
  Utilities that help with managing tenant's prefixed databases.
  """

  alias Ecto.Migration.SchemaMigration
  alias Lotta.Tenants.Tenant
  alias Lotta.Repo

  @spec create_tenant_database_schema(Tenant.t()) :: {:ok, [integer()]}
  def create_tenant_database_schema(tenant) do
    prefix = tenant.prefix

    config =
      Application.get_env(:lotta, Repo)
      |> Keyword.put(:name, nil)
      |> Keyword.put(:pool_size, 2)
      |> Keyword.put(:migration_default_prefix, prefix)
      |> Keyword.put(:prefix, prefix)
      |> Keyword.delete(:pool)

    {:ok, pid} = Repo.start_link(config)
    Repo.put_dynamic_repo(pid)

    query = """
    CREATE SCHEMA IF NOT EXISTS "#{prefix}"
    """

    Repo.query!(query)

    SchemaMigration.ensure_schema_migrations_table!(Repo, config, [])

    migrations =
      run_migrations(
        prefix: prefix,
        dynamic_repo: pid
      )

    Repo.stop(1000)
    Repo.put_dynamic_repo(Repo)

    {:ok, migrations}
  end

  @spec delete_tenant_schema(Tenant.t()) :: :ok | {:error, term()}
  def delete_tenant_schema(%Tenant{prefix: prefix}) do
    query = """
    DROP SCHEMA "#{prefix}" CASCADE
    """

    case Repo.query(query) do
      {:ok, _} ->
        :ok

      other ->
        other
    end
  end

  @doc """
  Run migrations for a given tenant
  """
  @doc since: "2.6.0"
  @spec run_migrations(Keyword.t()) :: [integer()]
  def run_migrations(options \\ []) do
    options = Keyword.put(options, :all, true)

    Ecto.Migrator.run(
      Repo,
      Application.app_dir(:lotta, "priv/repo/tenant_migrations"),
      :up,
      options
    )
  end
end
