defmodule Lotta.Repo.TenantMigrations.AddHideFullNameToUser do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:hide_full_name, :boolean, null: false, default: false)
    end
  end
end
