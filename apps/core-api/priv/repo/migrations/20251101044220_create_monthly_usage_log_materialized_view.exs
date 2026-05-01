defmodule Lotta.Repo.Migrations.CreateMonthlyUsageLogMaterializedView do
  use Ecto.Migration

  def up do
    execute("""
    CREATE MATERIALIZED VIEW monthly_usage_logs AS
    SELECT
      CAST(EXTRACT(YEAR FROM date) AS INTEGER) as year,
      CAST(EXTRACT(MONTH FROM date) AS INTEGER) as month,
      tenant_id,
      type,
      CASE
        WHEN type IN ('active_user_count', 'total_storage_count')
          THEN AVG(CAST(value AS DECIMAL))
        WHEN type = 'media_conversion_seconds'
          THEN SUM(CAST(value AS DECIMAL))
      END as value,
      MAX(updated_at) as updated_at
    FROM usage_logs
    GROUP BY year, month, tenant_id, type
    """)

    # Create unique index to support concurrent refresh
    create(
      unique_index(:monthly_usage_logs, [:tenant_id, :year, :month, :type],
        name: :monthly_usage_logs_unique_idx
      )
    )

    # Additional index for efficient queries by tenant
    create(index(:monthly_usage_logs, [:tenant_id]))

    # Index for time-based queries
    create(index(:monthly_usage_logs, [:year, :month]))
  end

  def down do
    execute("DROP MATERIALIZED VIEW IF EXISTS monthly_usage_logs")
  end
end
