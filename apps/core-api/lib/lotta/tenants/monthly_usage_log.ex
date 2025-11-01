defmodule Lotta.Tenants.MonthlyUsageLog do
  @moduledoc """
  Ecto Schema for monthly usage logs materialized view.

  This is a read-only schema backed by a materialized view that aggregates
  usage_logs data by month. The view must be refreshed to reflect new data.
  """
  use Ecto.Schema

  @type t :: %__MODULE__{
          year: integer(),
          month: integer(),
          value: Decimal.t(),
          type: :active_user_count | :total_storage_count | :media_conversion_seconds,
          updated_at: DateTime.t(),
          tenant_id: integer()
        }

  @primary_key false
  schema "monthly_usage_logs" do
    field(:year, :integer)
    field(:month, :integer)
    field(:value, :decimal)

    field(:type, Ecto.Enum,
      values: [:active_user_count, :total_storage_count, :media_conversion_seconds]
    )

    field(:updated_at, :utc_datetime)

    belongs_to(:tenant, Lotta.Tenants.Tenant)
  end
end
