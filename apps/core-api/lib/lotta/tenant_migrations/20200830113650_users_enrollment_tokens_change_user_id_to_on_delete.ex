defmodule Lotta.Repo.TenantMigrations.UsersEnrollmentTokensChangeUserIdToOnDelete do
  @moduledoc false

  use Ecto.Migration

  def up do
    drop(constraint(:users_enrollment_tokens, "users_enrollment_tokens_user_id_fkey"))

    alter table(:users_enrollment_tokens) do
      modify(:user_id, references(:users, on_delete: :delete_all))
    end

    create(index(:users_enrollment_tokens, [:enrollment_token]))
  end

  def down do
    drop(constraint(:users_enrollment_tokens, "users_enrollment_tokens_user_id_fkey"))

    alter table(:users_enrollment_tokens) do
      modify(:user_id, references(:users, on_delete: :nothing))
    end

    drop(index(:users_enrollment_tokens, [:enrollment_token]))
  end
end
