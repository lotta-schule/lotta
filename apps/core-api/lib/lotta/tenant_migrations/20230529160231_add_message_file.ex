defmodule Lotta.Repo.TenantMigrations.AddMessageFile do
  @moduledoc false

  use Ecto.Migration

  def change do
    create table(:message_file, primary_key: false) do
      add :message_id, references(:messages, on_delete: :delete_all, primary_key: true)
      add :file_id, references(:files, type: :uuid, on_delete: :delete_all, primary_key: true)
    end

    create(index(:message_file, [:message_id]))
    create(index(:message_file, [:file_id]))
  end
end
