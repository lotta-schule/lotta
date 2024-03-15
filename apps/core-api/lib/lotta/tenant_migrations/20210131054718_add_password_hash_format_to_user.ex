defmodule Lotta.Repo.TenantMigrations.AddPasswordHashFormatToUser do
  @moduledoc false

  use Ecto.Migration
  alias Lotta.Repo

  def up do
    alter table(:users) do
      add(:password_hash_format, :integer)
    end

    flush()

    Repo.query(
      "UPDATE #{prefix()}.users SET password_hash_format=0 WHERE password_hash IS NOT NULL;"
    )
  end

  def down do
    alter table(:users) do
      remove(:password_hash_format)
    end
  end
end
