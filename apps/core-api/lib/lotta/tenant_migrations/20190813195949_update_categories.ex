defmodule Lotta.Repo.TenantMigrations.UpdateCategories do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:categories) do
      add(:banner_image_file_id, references(:files, on_delete: :nothing))
      add(:group_id, references(:user_groups, on_delete: :nothing))
      add(:sort_key, :integer, null: false, default: 0)
      add(:redirect, :string)
    end
  end
end
