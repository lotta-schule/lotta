defmodule Lotta.Repo.Migration.AddFeedback do
  use Ecto.Migration

  def change do
    create table(:feedbacks, primary_key: [name: :id, type: :binary_id]) do
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :topic, :string, null: false
      add :content, :string, null: false
      add :is_new, :boolean, null: false, default: true
      add :is_forwarded, :boolean, null: false, default: false
      add :is_responded, :boolean, null: false, default: false
      add :metadata, :string

      timestamps()
    end

  end
end
