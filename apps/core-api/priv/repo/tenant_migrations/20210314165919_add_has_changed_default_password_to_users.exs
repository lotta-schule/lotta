defmodule Lotta.Repo.TenantMigrations.AddHasChangedDefaultPasswordToUsers do
  use Ecto.Migration

  import Ecto.Query

  alias Lotta.Repo

  def up do
    alter table(:users) do
      add(:has_changed_default_password, :boolean, default: false)
    end

    flush()

    from("users")
    |> put_query_prefix(prefix())
    |> Repo.update_all(set: [has_changed_default_password: true])
  end

  def down do
    alter table(:users) do
      remove(:has_changed_default_password)
    end
  end
end
