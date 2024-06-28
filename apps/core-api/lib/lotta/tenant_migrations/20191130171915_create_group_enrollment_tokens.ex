defmodule Lotta.Repo.TenantMigrations.CreateGroupEnrollmentTokens do
  @moduledoc false

  use Ecto.Migration

  def change do
    create table(:group_enrollment_tokens) do
      add(:token, :string)
      add(:group_id, references(:user_groups, on_delete: :delete_all), null: false)

      timestamps()
    end
  end
end
