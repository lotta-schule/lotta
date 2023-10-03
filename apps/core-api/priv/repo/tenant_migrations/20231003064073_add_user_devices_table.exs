defmodule Lotta.Repo.Migration.AddUserDevicesTable do
  use Ecto.Migration

  def change do
    create table(:user_devices, primary_key: [name: :id, type: :binary_id]) do
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :custom_name, :string, null: true
      add :platform, :string, null: false
      add :device_type, :string, null: false
      add :model_name, :string, null: false
      add :last_used, :utc_datetime, default: fragment("now()"), null: false
      add :push_token, :string, null: true
      add :push_token_type, :string, null: true
      add :active, :boolean, null: false, default: true

      timestamps()
    end

    create index(:user_devices, [:push_token], unique: true)
    create index(:user_devices, [:user_id, :push_token])
  end
end
