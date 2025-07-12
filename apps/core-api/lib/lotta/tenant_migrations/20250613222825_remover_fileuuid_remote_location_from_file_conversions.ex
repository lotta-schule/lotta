defmodule Lotta.Repo.TenantMigrations.RemoveFileUUIDAndRemoteLocationFromFileConversions do
  @moduledoc false

  use Ecto.Migration

  def up do
    alter table(:file_conversions) do
      remove_if_exists(:file_uuid, :uuid)
      remove_if_exists(:remote_location, :string)
    end
  end

  def down do
    alter table(:file_conversions) do
      add(:file_uuid, :uuid)
      add(:remote_location, :string)
    end
  end
end
