defmodule Lotta.Repo.TenantMigrations.CreateUserUserGroup do
  @moduledoc false

  use Ecto.Migration

  def change do
    create table(:user_user_group, primary_key: false) do
      add(:user_id, references(:users, on_delete: :delete_all), primary_key: true)
      add(:user_group_id, references(:user_groups, on_delete: :delete_all), primary_key: true)
    end

    create(index(:user_user_group, [:user_id]))
    create(index(:user_user_group, [:user_group_id]))

    create(
      unique_index(:user_user_group, [:user_id, :user_group_id],
        name: :user_id_group_id_unique_index
      )
    )
  end
end
