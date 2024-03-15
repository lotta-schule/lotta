defmodule Lotta.Repo.TenantMigrations.CreateMessages do
  @moduledoc false

  use Ecto.Migration

  def change do
    create table(:messages) do
      add(:content, :string)
      add(:sender_user_id, references(:users, on_delete: :delete_all))
      add(:recipient_user_id, references(:users, on_delete: :delete_all))
      add(:recipient_group_id, references(:user_groups, on_delete: :delete_all))

      timestamps()
    end

    create(index(:messages, [:sender_user_id]))
    create(index(:messages, [:recipient_user_id]))
    create(index(:messages, [:recipient_group_id]))
  end
end
