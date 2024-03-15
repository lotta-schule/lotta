defmodule Lotta.Repo.TenantMigrations.ChangeEnrollmentTokensToArrays do
  @moduledoc false

  use Ecto.Migration

  def up do
    alter table(:users) do
      add(:enrollment_tokens, {:array, :string})
    end

    create(index(:users, :enrollment_tokens))

    alter table(:user_groups) do
      add(:enrollment_tokens, {:array, :string})
    end

    create(index(:user_groups, :enrollment_tokens))

    flush()

    repo().query("UPDATE #{prefix()}.user_groups
        SET enrollment_tokens = (
          SELECT ARRAY(
            SELECT token FROM #{prefix()}.group_enrollment_tokens WHERE group_id = user_groups.id
          )
        );")

    repo().query("UPDATE #{prefix()}.users
        SET enrollment_tokens = (
          SELECT ARRAY(
            SELECT enrollment_token FROM #{prefix()}.users_enrollment_tokens WHERE user_id = users.id
          )
        );")

    flush()

    drop(table(:users_enrollment_tokens))
    drop(table(:group_enrollment_tokens))
  end

  def down do
    create table(:users_enrollment_tokens) do
      add(:user_id, references(:users, on_delete: :delete_all))
      add(:enrollment_token, :string)

      timestamps()
    end

    create(index(:users_enrollment_tokens, [:user_id, :enrollment_token]))

    create table(:group_enrollment_tokens) do
      add(:token, :string)
      add(:group_id, references(:user_groups, on_delete: :delete_all), null: false)

      timestamps()
    end

    flush()

    repo().query("
        INSERT INTO #{prefix()}.users_enrollment_tokens (user_id, enrollment_token)
          SELECT id, unnest(enrollment_tokens) FROM #{prefix()}.users;")

    repo().query("
        INSERT INTO #{prefix()}.group_enrollment_tokens (group_id, token)
          SELECT id, unnest(enrollment_tokens) FROM #{prefix()}.user_groups;")

    flush()

    alter table(:users) do
      drop(:enrollment_tokens)
    end

    alter table(:user_groups) do
      drop(:enrollment_tokens)
    end
  end
end
