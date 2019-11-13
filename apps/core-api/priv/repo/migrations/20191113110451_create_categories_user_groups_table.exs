defmodule Api.Repo.Migrations.CreateCategoriesUserGroupsTable do
  use Ecto.Migration
  import Ecto.Query

  def up do

    create table(:categories_user_groups, primary_key: false) do
      add :category_id, references(:categories, on_delete: :delete_all), primary_key: true
      add :group_id, references(:user_groups, on_delete: :delete_all), primary_key: true
    end

    create index(:categories_user_groups, [:category_id])
    create index(:categories_user_groups, [:group_id])

    create unique_index(:categories_user_groups, [:category_id, :group_id], name: :category_id_group_id_unique_index)

    flush()

    from(a in "categories", select: [:id, :group_id])
    |> Api.Repo.all()
    |> Enum.filter(fn row -> !is_nil(row.group_id) end)
    |> Enum.each(fn category ->
      Api.Repo.insert_all("categories_user_groups", [
        [category_id: category.id, group_id: category.group_id]
      ])
    end)

    alter table(:categories) do
      remove :group_id
    end

  end

  def down do

    alter table(:categories) do
      add :group_id, references(:user_groups)
    end

    flush()

    from(aug in "categories_user_groups", select: [:category_id, :group_id])
    |> Api.Repo.all()
    |> Enum.each(fn row ->
      Api.Repo.update_all(
        from(a in "categories", where: a.id == ^row.category_id),
        set: [group_id: row.group_id]
      )
    end)

    drop table(:categories_user_groups)
  end
end
