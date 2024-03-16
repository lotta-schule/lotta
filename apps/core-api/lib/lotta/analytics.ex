defmodule Lotta.Analytics do
  @moduledoc """
  Communicates with Plausible Analytics to get analytics data
  """
  alias LottaWeb.Urls
  alias Lotta.Tenants.Tenant

  use Tesla

  @doc """
  Get the number of currently active users in (more or less) realtime
  """
  @doc since: "4.2.0"
  @spec get_realtime_users(tenant :: Tenant.t()) :: {:ok, integer()} | {:error, any()}
  def get_realtime_users(tenant) do
    host = Urls.get_tenant_host(tenant)

    with client when not is_nil(client) <- client(host),
         {:ok, %{body: body}} <- get(client, "/realtime/visitors") do
      {:ok, body}
    else
      nil ->
        {:error, "Analytics is not enabled"}

      {:error, %{status_code: status_code, body: body}} ->
        {:error, "Failed to get realtime users: #{status_code} - #{body}"}

      _ ->
        {:error, "Unknown error"}
    end
  end

  @doc """
  Get the relevant metrics for a given period of time, aggregated
  """
  @doc since: "4.2.0"
  @spec get_aggregation_metrics(Tenant.t(), String.t(), String.t()) ::
          {:ok, map()} | {:error, any()}
  def get_aggregation_metrics(tenant, period, date) do
    host = Urls.get_tenant_host(tenant)

    with client when not is_nil(client) <- client(host),
         {:ok, %{body: %{"results" => results}}} <-
           get(client, "/aggregate",
             query: [
               period: period,
               date: date,
               metrics:
                 Enum.join(
                   [
                     :visits,
                     :visitors,
                     :pageviews,
                     :bounce_rate,
                     :views_per_visit,
                     :visit_duration
                   ],
                   ","
                 )
             ]
           ) do
      {:ok,
       Enum.reduce(results, %{}, fn {key, %{"value" => value}}, acc ->
         Map.put(acc, String.to_existing_atom(key), value)
       end)}
    else
      nil ->
        {:error, "Analytics is not enabled"}

      {:error, %{status_code: status_code, body: body}} ->
        {:error, "Failed to get realtime users: #{status_code} - #{body}"}

      _ ->
        {:error, "Unknown error"}
    end
  end

  @doc """
  Get the relevant metrics for a given period of time, in a timeseries
  in days
  """
  @doc since: "4.2.0"
  @spec get_aggregation_metrics(Tenant.t(), String.t(), String.t()) ::
          {:ok, map()} | {:error, any()}
  def get_timeseries_metrics(tenant, period, date, metric) do
    metric_string = to_string(metric)

    host = Urls.get_tenant_host(tenant)

    with client when not is_nil(client) <- client(host),
         {:ok, %{body: %{"results" => results}}} <-
           get(client, "/timeseries",
             query: [
               period: period,
               date: date,
               metrics: metric_string
             ]
           ) do
      {:ok,
       Enum.map(results, fn %{"date" => date, ^metric_string => value} ->
         %{date: date, value: value}
       end)}
    else
      nil ->
        {:error, "Analytics is not enabled"}

      {:error, %{status_code: status_code, body: body}} ->
        {:error, "Failed to get realtime users: #{status_code} - #{body}"}

      _ ->
        {:error, "Unknown error"}
    end
  end

  @spec client(site_id :: String.t()) :: Tesla.Client.t() | nil
  def client(side_id) do
    unless is_nil(config(:endpoint)) or is_nil(config(:api_key)) do
      middleware = [
        Tesla.Middleware.OpenTelemetry,
        {Tesla.Middleware.BaseUrl, config(:endpoint) <> "/api/v1/stats"},
        Tesla.Middleware.PathParams,
        {Tesla.Middleware.Query, [site_id: side_id]},
        {Tesla.Middleware.BearerAuth, token: config(:api_key)},
        Tesla.Middleware.JSON
      ]

      Tesla.client(middleware)
    end
  end

  defp config(key), do: Keyword.get(config(), key)

  defp config() do
    Application.fetch_env!(:lotta, :analytics)
  end
end
