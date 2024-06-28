defmodule Lotta.Repo.TenantMigrations.CreateArticlesUserGroupsTable do
  @moduledoc false

  use Ecto.Migration

  def up do
    create table(:articles_user_groups, primary_key: false) do
      add(:article_id, references(:articles, on_delete: :delete_all), primary_key: true)
      add(:group_id, references(:user_groups, on_delete: :delete_all), primary_key: true)
    end

    create(index(:articles_user_groups, [:article_id]))
    create(index(:articles_user_groups, [:group_id]))

    create(
      unique_index(:articles_user_groups, [:article_id, :group_id],
        name: :article_id_group_id_unique_index
      )
    )

    alter table(:articles) do
      remove(:group_id)
    end
  end

  def down do
    alter table(:articles) do
      add(:group_id, references(:user_groups))
    end

    drop(table(:articles_user_groups))
  end
end
