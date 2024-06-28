defmodule Lotta.Repo.TenantMigrations.AddCanReadFullNameToUserGroups do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:user_groups) do
      add :can_read_full_name, :boolean
    end
  end
end
