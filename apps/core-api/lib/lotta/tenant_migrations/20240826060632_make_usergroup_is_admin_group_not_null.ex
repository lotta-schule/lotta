defmodule Lotta.Repo.TenantMigrations.MakeUserGroupIsAdminGroupNotNull do
  @moduledoc false

  use Ecto.Migration

  import Ecto.Query

  alias Lotta.Repo

  def up do
    from(u in "user_groups",
      where: is_nil(u.is_admin_group)
    )
    |> Repo.update_all([set: [is_admin_group: false]], prefix: prefix())

    flush()

    alter table(:user_groups) do
      modify :is_admin_group, :boolean,
        null: false,
        default: false
    end
  end

  def down do
    alter table(:user_groups) do
      modify :is_admin_group, :boolean,
        null: true,
        default: false
    end
  end
end
