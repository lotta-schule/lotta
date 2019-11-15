defmodule Api.Repo.Migrations.CreateWidgetsUserGroupsTable do
  use Ecto.Migration
  import Ecto.Query
  alias Api.Accounts.UserGroup

  def up do

    create table(:widgets_user_groups, primary_key: false) do
      add :widget_id, references(:widgets, on_delete: :delete_all), primary_key: true
      add :group_id, references(:user_groups, on_delete: :delete_all), primary_key: true
    end

    create index(:widgets_user_groups, [:widget_id])
    create index(:widgets_user_groups, [:group_id])

    create unique_index(:widgets_user_groups, [:widget_id, :group_id], name: :widget_id_group_id_unique_index)

    flush()

    from(a in "widgets", select: [:id, :group_id])
    |> Api.Repo.all()
    |> Enum.filter(fn row -> !is_nil(row.group_id) end)
    |> Enum.each(fn widget ->
      user_group = Api.Repo.one!(from ug in UserGroup, where: ug.id == ^widget.group_id)
      groups = Api.Repo.all(from ug in UserGroup, where: ug.sort_key >= ^user_group.sort_key)
      Api.Repo.insert_all("widgets_user_groups", Enum.map(groups, fn group ->
        [widget_id: widget.id, group_id: group.id]
      end))
    end)

    alter table(:widgets) do
      remove :group_id
    end

  end

  def down do

    alter table(:widgets) do
      add :group_id, references(:user_groups)
    end

    flush()

    from(aug in "widgets_user_groups", select: [:widget_id, :group_id])
    |> Api.Repo.all()
    |> Enum.reduce(%{}, fn widget_user_group, acc ->
      group = Api.Repo.one!(from ug in UserGroup, where: ug.id == ^widget_user_group.group_id)
      acc
      |> Map.put(
        widget_user_group.widget_id,
        case acc[widget_user_group.widget_id] && acc[widget_user_group.widget_id] do
          nil ->
            group
          old_group ->
            if group.sort_key < old_group.sort_key, do: group, else: old_group
        end
      )
    end)
    |> Enum.each(fn {widget_id, group} ->
      Api.Repo.update_all(
        from(a in "widgets", where: a.id == ^widget_id),
        set: [group_id: group.id]
      )
    end)

    drop table(:widgets_user_groups)
  end
end
