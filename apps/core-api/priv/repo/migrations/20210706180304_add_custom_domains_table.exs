defmodule Lotta.Repo.Migrations.AddCustomDomainsTable do
  use Ecto.Migration

  def change do
    create table(:custom_domains) do
      add(:host, :string)
      add(:is_main_domain, :boolean)
      add(:tenant_id, references(:tenants, on_delete: :delete_all), null: false)

      timestamps()
    end

    create(index(:custom_domains, [:host]))
    create(index(:custom_domains, [:tenant_id]))
    create(index(:custom_domains, [:tenant_id, :is_main_domain]))
  end
end
