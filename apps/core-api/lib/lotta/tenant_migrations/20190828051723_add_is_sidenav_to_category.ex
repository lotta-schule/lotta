defmodule Lotta.Repo.TenantMigrations.AddIsSidenavToCategory do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:categories) do
      add(:is_sidenav, :boolean, default: false)
    end
  end
end
