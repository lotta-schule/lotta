defmodule Api.Repo.Migrations.CreateTableDirectories do
  use Ecto.Migration

  def up do
    create table(:directories) do
      add(:parent_directory_id, references(:directories, on_delete: :delete_all))
      add(:name, :string)
      add(:user_id, references(:users, on_delete: :nothing))
      add(:tenant_id, references(:tenants, on_delete: :nothing))
      add(:group_id, references(:user_groups, on_delete: :nothing))

      timestamps()
    end

    alter table(:files) do
      add(:parent_directory_id, references(:directories, on_delete: :delete_all))
    end

    create(index(:directories, [:user_id, :tenant_id]))
    create(index(:directories, [:user_id, :tenant_id, :parent_directory_id]))
    create(index(:directories, [:group_id]))
    create(index(:directories, [:parent_directory_id]))

    create(unique_index(:directories, [:name, :parent_directory_id, :user_id, :tenant_id]))

    create(index(:files, [:parent_directory_id]))
  end

  def down do
    drop(index(:files, [:parent_directory_id]))

    alter table(:files) do
      remove(:parent_directory_id)
    end

    drop(table(:directories))
  end
end
