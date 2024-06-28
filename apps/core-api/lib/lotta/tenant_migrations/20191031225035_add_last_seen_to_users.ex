defmodule Lotta.Repo.TenantMigrations.AddLastSeenToUsers do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:last_seen, :utc_datetime)
    end
  end
end
