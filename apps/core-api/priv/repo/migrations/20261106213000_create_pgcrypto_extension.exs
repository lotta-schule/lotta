defmodule Lotta.Repo.Migrations.CreatePgcryptoExtension do
  @moduledoc """
  The tenant migrations need the (database-wide) pgcrypto extension and create
  it with `CREATE EXTENSION IF NOT EXISTS`. That statement is not safe to run
  concurrently: on a fresh database, tenants created in parallel fail with a
  unique violation on pg_extension. Creating it here, before any tenant is
  created, avoids that race. On existing databases this is a no-op.
  """
  use Ecto.Migration

  def up do
    execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
  end

  # The extension is required by the tenant schemas, so it is not dropped again.
  def down, do: :ok
end
