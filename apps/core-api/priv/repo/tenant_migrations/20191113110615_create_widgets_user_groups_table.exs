defmodule Lotta.Repo.TenantMigrations.CreateWidgetsUserGroupsTable do
  use Ecto.Migration

  def up do
    create table(:widgets_user_groups, primary_key: false) do
      add(:widget_id, references(:widgets, on_delete: :delete_all), primary_key: true)
      add(:group_id, references(:user_groups, on_delete: :delete_all), primary_key: true)
    end

    create(index(:widgets_user_groups, [:widget_id]))
    create(index(:widgets_user_groups, [:group_id]))

    create(
      unique_index(:widgets_user_groups, [:widget_id, :group_id],
        name: :widget_id_group_id_unique_index
      )
    )

    alter table(:widgets) do
      remove(:group_id)
    end
  end

  def down do
    alter table(:widgets) do
      add(:group_id, references(:user_groups))
    end

    drop(table(:widgets_user_groups))
  end
end
