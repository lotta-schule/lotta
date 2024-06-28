defmodule Lotta.Repo.TenantMigrations.CreateConversationUserLastSeenTable do
  @moduledoc false

  use Ecto.Migration

  def change do
    create table(:conversation_user_last_seen, primary_key: false, prefix: prefix()) do
      add(:conversation_id, references(:conversations, type: :uuid, on_delete: :delete_all))
      add(:user_id, references(:users, on_delete: :delete_all))
      add(:last_seen, :utc_datetime)
    end

    create(
      index(:conversation_user_last_seen, [:conversation_id, :user_id],
        unique: true,
        prefix: prefix()
      )
    )
  end
end
