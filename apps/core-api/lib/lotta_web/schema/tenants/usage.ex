defmodule LottaWeb.Schema.Tenants.Usage do
  @moduledoc false

  use Absinthe.Schema.Notation

  @desc "Usage data for a specific usage type with value and timestamp"
  object :usage_type_data do
    field :value, non_null(:float) do
      resolve(fn data, _, _ ->
        # Convert Decimal to Float for GraphQL
        float_value = data.value |> Decimal.to_float()
        {:ok, float_value}
      end)
    end

    field(:updated_at, non_null(:datetime))
  end

  @desc "Monthly usage statistics for a specific month, grouped by usage type"
  object :monthly_usage_period do
    field(:year, non_null(:integer))
    field(:month, non_null(:integer))
    field(:active_user_count, :usage_type_data)
    field(:total_storage_count, :usage_type_data)
    field(:media_conversion_seconds, :usage_type_data)
  end
end
