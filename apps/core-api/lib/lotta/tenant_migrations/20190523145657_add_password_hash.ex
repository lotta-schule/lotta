defmodule Lotta.Repo.TenantMigrations.AddPasswordHash do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:password_hash, :string)
    end
  end
end
