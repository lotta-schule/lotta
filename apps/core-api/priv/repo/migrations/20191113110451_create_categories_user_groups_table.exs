defmodule Api.Repo.Migrations.CreateCategoriesUserGroupsTable do
  use Ecto.Migration
  import Ecto.Query
  alias Api.Accounts.UserGroup

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
      user_group = Api.Repo.one!(from ug in UserGroup, where: ug.id == ^category.group_id)
      groups = Api.Repo.all(from ug in UserGroup, where: ug.sort_key >= ^user_group.sort_key)
      Api.Repo.insert_all("categories_user_groups", Enum.map(groups, fn group ->
        [category_id: category.id, group_id: group.id]
      end))
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
    |> Enum.reduce(%{}, fn category_user_group, acc ->
      group = Api.Repo.one!(from ug in UserGroup, where: ug.id == ^category_user_group.group_id)
      acc
      |> Map.put(
        category_user_group.category_id,
        case acc[category_user_group.category_id] && acc[category_user_group.category_id] do
          nil ->
            group
          old_group ->
            if group.sort_key < old_group.sort_key, do: group, else: old_group
        end
      )
    end)
    |> Enum.each(fn {category_id, group} ->
      Api.Repo.update_all(
        from(a in "categories", where: a.id == ^category_id),
        set: [group_id: group.id]
      )
    end)

    drop table(:categories_user_groups)
  end
end
