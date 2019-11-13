defmodule Api.Repo.Migrations.CreateArticlesUserGroupsTable do
  use Ecto.Migration
  import Ecto.Query

  def up do

    create table(:articles_user_groups, primary_key: false) do
      add :article_id, references(:articles, on_delete: :delete_all), primary_key: true
      add :group_id, references(:user_groups, on_delete: :delete_all), primary_key: true
    end

    create index(:articles_user_groups, [:article_id])
    create index(:articles_user_groups, [:group_id])

    create unique_index(:articles_user_groups, [:article_id, :group_id], name: :article_id_group_id_unique_index)

    flush()

    from(a in "articles", select: [:id, :group_id])
    |> Api.Repo.all()
    |> Enum.filter(fn row -> !is_nil(row.group_id) end)
    |> Enum.each(fn article ->
      Api.Repo.insert_all("articles_user_groups", [
        [article_id: article.id, group_id: article.group_id]
      ])
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
    |> Enum.each(fn row ->
      Api.Repo.update_all(
        from(a in "articles", where: a.id == ^row.article_id),
        set: [group_id: row.group_id]
      )
    end)

    drop table(:articles_user_groups)
  end

end
