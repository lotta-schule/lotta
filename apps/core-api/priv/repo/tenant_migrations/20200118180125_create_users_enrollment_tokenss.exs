defmodule Lotta.Repo.TenantMigrations.CreateUsersEnrollmentTokens do
  use Ecto.Migration

  def change do
    create table(:users_enrollment_tokens) do
      add(:user_id, references(:users, on_delete: :nothing))
      add(:enrollment_token, :string)

      timestamps()
    end

    create(index(:users_enrollment_tokens, [:user_id, :enrollment_token]))
  end
end
