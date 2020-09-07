defmodule Api.Repo.Migrations.CreateCategoriesUserGroupsTable do
  use Ecto.Migration

  def up do
    create table(:categories_user_groups, primary_key: false) do
      add(:category_id, references(:categories, on_delete: :delete_all), primary_key: true)
      add(:group_id, references(:user_groups, on_delete: :delete_all), primary_key: true)
    end

    create(index(:categories_user_groups, [:category_id]))
    create(index(:categories_user_groups, [:group_id]))

    create(
      unique_index(:categories_user_groups, [:category_id, :group_id],
        name: :category_id_group_id_unique_index
      )
    )

    alter table(:categories) do
      remove(:group_id)
    end
  end

  def down do
    alter table(:categories) do
      add(:group_id, references(:user_groups))
    end

    drop(table(:categories_user_groups))
  end
end
