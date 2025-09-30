defmodule Lotta.Repo.TenantMigrations.AddEduplacesIdsToUsersAndGroups do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:eduplaces_id, :string, null: true, default: nil)
    end

    alter table(:user_groups) do
      add(:eduplaces_id, :string, null: true, default: nil)
    end

    create(unique_index(:users, [:eduplaces_id], name: :unique_eduplaces_user_id))
    create(unique_index(:user_groups, [:eduplaces_id], name: :unique_eduplaces_group_id))
  end
end
