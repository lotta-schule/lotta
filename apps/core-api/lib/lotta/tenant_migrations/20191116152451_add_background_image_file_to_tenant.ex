defmodule Lotta.Repo.TenantMigrations.AddBackgroundImageFileToTenant do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:tenants) do
      add(:background_image_file_id, references(:files, on_delete: :nothing))
    end

    create(index(:tenants, [:background_image_file_id]))
  end
end
