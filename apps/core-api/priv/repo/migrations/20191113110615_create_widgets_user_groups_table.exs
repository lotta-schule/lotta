defmodule Api.Repo.Migrations.CreateWidgetsUserGroupsTable do
  use Ecto.Migration

  use Ecto.Migration
  import Ecto.Query

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
      Api.Repo.insert_all("widgets_user_groups", [
        [widget_id: widget.id, group_id: widget.group_id]
      ])
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
    |> Enum.each(fn row ->
      Api.Repo.update_all(
        from(a in "widgets", where: a.id == ^row.widget_id),
        set: [group_id: row.group_id]
      )
    end)

    drop table(:widgets_user_groups)
  end
end
