defmodule Lotta.Repo.TenantMigrations.RemoveTenantColumns do
  @moduledoc false

  use Ecto.Migration

  def up do
    alter table("categories") do
      remove(:tenant_id, :integer)
    end

    alter table("users") do
      remove(:tenant_id, :integer)
      add(:is_blocked, :boolean, default: false)
    end

    alter table("user_groups") do
      remove(:tenant_id, :integer)
    end

    alter table("directories") do
      remove(:tenant_id, :integer)
    end

    create(unique_index(:directories, [:name, :parent_directory_id, :user_id]))

    alter table("files") do
      remove(:tenant_id, :integer)
    end

    alter table("widgets") do
      remove(:tenant_id, :integer)
    end

    alter table("articles") do
      remove(:tenant_id, :integer)
    end

    alter table("custom_domains") do
      remove(:tenant_id, :integer)
    end

    drop_if_exists(table("blocked_tenants"))

    create table("configuration", primary_key: false) do
      add(:name, :string)
      add(:string_value, :string)
      add(:json_value, :jsonb)
      add(:file_value_id, references(:files, on_delete: :delete_all))

      timestamps()
    end

    create(unique_index("configuration", [:name]))
  end

  def down do
    alter table("categories") do
      add(:tenant_id, :integer)
    end

    alter table("users") do
      add(:tenant_id, :integer)
      remove(:is_blocked, :boolean)
    end

    alter table("user_groups") do
      add(:tenant_id, :integer)
    end

    alter table("directories") do
      add(:tenant_id, :integer)
    end

    drop(unique_index(:directories, [:name, :parent_directory_id, :user_id]))

    alter table("files") do
      add(:tenant_id, :integer)
    end

    alter table("widgets") do
      add(:tenant_id, :integer)
    end

    alter table("articles") do
      add(:tenant_id, :integer)
    end

    alter table("custom_domains") do
      add(:tenant_id, :integer)
    end

    create table("blocked_tenants") do
      add(:tenant_id, :integer)
      add(:user_id, :integer)
      timestamps()
    end

    drop(table("configuration"))
  end
end
