defmodule Lotta.Tenants.Usage do
  @moduledoc """
  This module provides functions for retrieving usage statistics
  from the monthly usage logs materialized view.
  """

  alias Lotta.Tenants
  alias Lotta.Tenants.Tenant

  @doc """
  Returns the monthly usage statistics for a tenant, grouped by year and month.

  The return value is a list of maps, where each map represents a month
  and contains all usage types for that month. The list is sorted by date
  descending (most recent first).

  ## Returns

  `{:ok, [
    %{
      year: 2025,
      month: 11,
      active_user_count: %{value: Decimal.new("150"), updated_at: ~U[...]},
      total_storage_count: %{value: Decimal.new("5000000"), updated_at: ~U[...]},
      media_conversion_seconds: %{value: Decimal.new("3600"), updated_at: ~U[...]}
    },
    ...
  ]}`

  ## Examples

      iex> get_usage(tenant)
      {:ok, [
        %{
          year: 2025,
          month: 11,
          active_user_count: %{value: Decimal.new("150"), updated_at: ~U[...]},
          total_storage_count: %{value: Decimal.new("5000000"), updated_at: ~U[...]},
          media_conversion_seconds: %{value: Decimal.new("3600"), updated_at: ~U[...]}
        }
      ]}

  """
  @spec get_usage(Tenant.t()) :: {:ok, list(map())}
  def get_usage(tenant) do
    all_logs = Tenants.get_monthly_usage_logs(tenant)

    result =
      all_logs
      |> Enum.group_by(fn log -> {log.year, log.month} end)
      |> Enum.map(fn {{year, month}, logs} ->
        build_usage_period(year, month, logs)
      end)
      |> Enum.sort_by(fn %{year: year, month: month} -> {year, month} end, :desc)

    {:ok, result}
  end

  @doc """
  Returns the monthly usage statistics for a tenant for a specific year and month.

  ## Parameters

    * `tenant` - The tenant to get usage statistics for
    * `year` - The year to get statistics for
    * `month` - The month to get statistics for (1-12)

  ## Returns

  `{:ok, %{year: ..., month: ..., active_user_count: ..., total_storage_count: ..., media_conversion_seconds: ...}}`
  or `{:ok, nil}` if no usage data exists for that period.

  ## Examples

      iex> get_usage(tenant, 2025, 11)
      {:ok, %{
        year: 2025,
        month: 11,
        active_user_count: %{value: Decimal.new("150"), updated_at: ~U[...]},
        total_storage_count: %{value: Decimal.new("5000000"), updated_at: ~U[...]},
        media_conversion_seconds: %{value: Decimal.new("3600"), updated_at: ~U[...]}
      }}

  """
  @spec get_usage(Tenant.t(), year :: integer(), month :: integer()) :: map() | nil
  def get_usage(tenant, year, month) do
    case Tenants.get_monthly_usage_logs(tenant, year: year, month: month) do
      [] -> nil
      logs -> build_usage_period(year, month, logs)
    end
  end

  defp build_usage_period(year, month, logs) do
    logs_by_type =
      logs
      |> Enum.map(fn log ->
        {log.type, %{value: log.value, updated_at: log.updated_at}}
      end)
      |> Map.new()

    %{
      year: year,
      month: month,
      active_user_count: Map.get(logs_by_type, :active_user_count),
      total_storage_count: Map.get(logs_by_type, :total_storage_count),
      media_conversion_seconds: Map.get(logs_by_type, :media_conversion_seconds)
    }
  end
end
