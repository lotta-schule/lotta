defmodule Lotta.Repo.TenantMigrations.RemoveFileUUIDAndRemoteLocationFromFileConversions do
  @moduledoc false

  use Ecto.Migration

  def up do
    alter table(:file_conversions) do
      remove(:file_uuid, :uuid)
      remove(:remote_location, :string)
    end
  end

  def down do
    alter table(:file_conversions) do
      add(:file_uuid, :uuid, default: nil)
      add(:remote_location, :string, default: nil)
    end
  end
end
