defmodule Api.Repo.Migrations.CreateArticlesUserGroupsTable do
  use Ecto.Migration
  import Ecto.Query
  alias Api.Accounts.UserGroup

  def up do
    create table(:articles_user_groups, primary_key: false) do
      add :article_id, references(:articles, on_delete: :delete_all), primary_key: true
      add :group_id, references(:user_groups, on_delete: :delete_all), primary_key: true
    end

    create index(:articles_user_groups, [:article_id])
    create index(:articles_user_groups, [:group_id])

    create unique_index(:articles_user_groups, [:article_id, :group_id],
             name: :article_id_group_id_unique_index
           )

    flush()

    from(a in "articles", select: [:id, :group_id])
    |> Api.Repo.all()
    |> Enum.filter(fn row -> !is_nil(row.group_id) end)
    |> Enum.each(fn article ->
      user_group = Api.Repo.one!(from(ug in UserGroup, where: ug.id == ^article.group_id))
      groups = Api.Repo.all(from(ug in UserGroup, where: ug.sort_key >= ^user_group.sort_key))

      Api.Repo.insert_all(
        "articles_user_groups",
        Enum.map(groups, fn group ->
          [article_id: article.id, group_id: group.id]
        end)
      )
    end)

    alter table(:articles) do
      remove :group_id
    end
  end

  def down do
    alter table(:articles) do
      add :group_id, references(:user_groups)
    end

    flush()

    from(aug in "articles_user_groups", select: [:article_id, :group_id])
    |> Api.Repo.all()
    |> Enum.reduce(%{}, fn article_user_group, acc ->
      group = Api.Repo.one!(from(ug in UserGroup, where: ug.id == ^article_user_group.group_id))

      acc
      |> Map.put(
        article_user_group.article_id,
        case acc[article_user_group.article_id] && acc[article_user_group.article_id] do
          nil ->
            group

          old_group ->
            if group.sort_key < old_group.sort_key, do: group, else: old_group
        end
      )
    end)
    |> Enum.each(fn {article_id, group} ->
      Api.Repo.update_all(
        from(a in "articles", where: a.id == ^article_id),
        set: [group_id: group.id]
      )
    end)

    drop table(:articles_user_groups)
  end
end
