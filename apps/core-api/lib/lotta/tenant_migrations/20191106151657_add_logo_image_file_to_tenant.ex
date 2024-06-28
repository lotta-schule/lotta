defmodule Lotta.Repo.TenantMigrations.AddLogoImageFileToTenant do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:tenants) do
      add(:logo_image_file_id, references(:files, on_delete: :nothing))
    end

    create(index(:tenants, [:logo_image_file_id]))
  end
end
