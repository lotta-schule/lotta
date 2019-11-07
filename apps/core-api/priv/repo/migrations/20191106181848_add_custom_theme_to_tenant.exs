defmodule Api.Repo.Migrations.AddCustomThemeToTenant do
  use Ecto.Migration

  def change do
    alter table(:tenants) do
      add :custom_theme, :json
    end
  end
end
