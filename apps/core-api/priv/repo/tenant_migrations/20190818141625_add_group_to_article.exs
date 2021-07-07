defmodule Lotta.Repo.TenantMigrations.AddGroupToArticle do
  use Ecto.Migration

  def change do
    alter table(:articles) do
      add(:group_id, references(:user_groups, on_delete: :nothing))
    end
  end
end
