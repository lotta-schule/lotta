defmodule Lotta.Repo.TenantMigrations.AddLayoutNameToCategories do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:categories) do
      add(:layout_name, :string)
    end
  end
end
