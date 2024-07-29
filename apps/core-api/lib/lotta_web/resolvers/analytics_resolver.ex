defmodule LottaWeb.AnalyticsResolver do
  @moduledoc false

  alias LottaWeb.Context
  alias Lotta.Analytics

  require Logger

  def realtime(_, %{context: %Context{tenant: tenant}}) do
    Analytics.get_realtime_users(tenant)
  end

  def aggregate(%{period: period, date: date}, %{context: %Context{tenant: tenant}}) do
    Analytics.get_aggregation_metrics(tenant, period, date)
  end

  def timeseries(%{period: period, date: date, metric: metric}, %{
        context: %Context{tenant: tenant}
      }) do
    Analytics.get_timeseries_metrics(tenant, period, date, metric)
  end

  def breakdown(%{period: period, date: date, property: property, metrics: metrics}, %{
        context: %Context{tenant: tenant}
      }) do
    Analytics.get_breakdown_metrics(tenant, period, date, property, metrics)
  end
end
