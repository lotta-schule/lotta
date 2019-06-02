defmodule Api.Repo.Migrations.AddTenantIdToArticles do
  use Ecto.Migration

  def change do
    alter table(:articles) do
      add :tenant_id, references(:tenants, on_delete: :delete_all)
      add :category_id, references(:categories)

      add :preview_image_url, :string
    end

    create index(:articles, [:tenant_id])
    create index(:articles, [:category_id])
    create index(:articles, [:tenant_id, :category_id])
  end
end
