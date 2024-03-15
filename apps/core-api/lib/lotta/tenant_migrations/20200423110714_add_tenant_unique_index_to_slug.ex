defmodule Lotta.Repo.TenantMigrations.AddTenantUniqueIndexToSlug do
  @moduledoc false

  use Ecto.Migration

  def change do
    create(unique_index(:tenants, [:slug]))
  end
end
