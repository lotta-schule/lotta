defmodule Api.Repo.Migrations.RemoveTenantColumns do
  use Ecto.Migration

  def change do
    alter table("categories") do
      remove(:tenant_id, :integer)
    end

    alter table("users") do
      remove(:tenant_id, :integer)
    end

    alter table("user_groups") do
      remove(:tenant_id, :integer)
    end

    alter table("directories") do
      remove(unique_index(:directories, [:name, :parent_directory_id, :user_id, :tenant_id]))
      remove(:tenant_id, :integer)
      add(unique_index(:directories, [:name, :parent_directory_id, :user_id]))
    end

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

    drop(table("blocked_tenants"))
  end
end
