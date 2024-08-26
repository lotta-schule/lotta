defmodule Lotta.Repo.TenantMigrations.MakeUserGroupCanReadFullNameNotNull do
  @moduledoc false

  use Ecto.Migration

  import Ecto.Query

  alias Lotta.Repo

  def up do
    from(u in "user_groups",
      where: is_nil(u.can_read_full_name)
    )
    |> Repo.update_all([set: [can_read_full_name: false]], prefix: prefix())

    flush()

    alter table(:user_groups) do
      modify :can_read_full_name, :boolean,
        null: false,
        default: false
    end
  end

  def down do
    alter table(:user_groups) do
      modify :can_read_full_name, :boolean,
        null: true,
        default: false
    end
  end
end
