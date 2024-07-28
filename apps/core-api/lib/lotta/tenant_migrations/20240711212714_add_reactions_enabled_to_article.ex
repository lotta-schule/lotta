defmodule Lotta.Repo.TenantMigrations.AddReactionsEnabledToArticle do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:articles) do
      add(:is_reactions_enabled, :boolean, default: false)
    end
  end
end
