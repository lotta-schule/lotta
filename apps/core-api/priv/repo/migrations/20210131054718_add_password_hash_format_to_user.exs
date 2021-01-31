defmodule Api.Repo.Migrations.AddPasswordHashFormatToUser do
  use Ecto.Migration
  alias Api.Repo

  def up do
    alter table(:users) do
      add :password_hash_format, :integer
    end

    flush()
    Api.Repo.query("UPDATE users SET password_hash_format=0 WHERE password_hash IS NOT NULL;")
  end

  def down do
    alter table(:users) do
      remove :password_hash_format
    end
  end
end
