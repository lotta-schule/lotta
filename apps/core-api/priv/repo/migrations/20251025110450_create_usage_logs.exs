defmodule Lotta.Repo.Migrations.CreateUsageLogs do
  use Ecto.Migration

  def change do
    create table(:usage_logs, primary_key: false) do
      add(:value, :string, null: false)
      add(:type, :string, null: false)
      add(:date, :date, null: false)
      add(:unique_identifier, :string, null: true)
      add(:tenant_id, references(:tenants, on_delete: :delete_all), null: false)

      timestamps()
    end

    # Index on tenant_id, type, year, and month for efficient monthly aggregations
    create(
      index(
        :usage_logs,
        [:tenant_id, :type, "EXTRACT(YEAR FROM date)", "EXTRACT(MONTH FROM date)"],
        name: :usage_logs_tenant_id_type_year_month_index
      )
    )

    # Index for queries by tenant, type, and date
    create(index(:usage_logs, [:tenant_id, :type, :date]))

    # Unique index on tenant_id and unique_identifier (only one entry per unique_identifier per tenant)
    create(
      unique_index(:usage_logs, [:tenant_id, :unique_identifier],
        name: :usage_logs_tenant_id_unique_identifier_index,
        where: "unique_identifier IS NOT NULL"
      )
    )
  end
end
