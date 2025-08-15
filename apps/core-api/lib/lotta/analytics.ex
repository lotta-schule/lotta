defmodule Lotta.Analytics do
  @moduledoc """
  Communicates with Plausible Analytics to get analytics data
  """
  alias LottaWeb.Urls
  alias Lotta.Tenants.Tenant

  require Logger

  @doc """
  Get the number of currently active users in (more or less) realtime

  API Documentation: https://plausible.io/docs/stats-api#get-apiv1statsrealtimevisitors
  """
  @doc since: "4.2.0"
  @spec get_realtime_users(tenant :: Tenant.t()) :: {:ok, integer()} | {:error, any()}
  def get_realtime_users(tenant) do
    identifier = Urls.get_tenant_identifier(tenant)

    with client when not is_nil(client) <- create_stats_client(identifier),
         {:ok, %{body: body, status: status}} when status < 400 <-
           Tesla.get(client, "/realtime/visitors") do
      {:ok, body}
    else
      nil ->
        {:error, "Analytics is not enabled"}

      {_, %{status: status, body: body}} ->
        Logger.error("Failed to get realtime user metrics: (#{status}) #{inspect(body)}")
        {:error, "Failed to get realtime user metrics: #{status}"}

      _ ->
        {:error, "Unknown error"}
    end
  end

  @doc """
  Get the relevant metrics for a given period of time, aggregated

  API Documentation: https://plausible.io/docs/stats-api#get-apiv1statsaggregate
  """
  @doc since: "4.2.0"
  @spec get_aggregation_metrics(Tenant.t(), String.t(), String.t()) ::
          {:ok, map()} | {:error, any()}
  def get_aggregation_metrics(tenant, period, date) do
    identifier = Urls.get_tenant_identifier(tenant)

    with client when not is_nil(client) <- create_stats_client(identifier),
         {:ok, %{body: %{"results" => results}, status: status}} when status < 400 <-
           Tesla.get(client, "/aggregate",
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

      {_, %{status: status, body: body}} ->
        Logger.error("Failed to get aggregation metrics: (#{status}) #{inspect(body)}")
        {:error, "Failed to get aggregation metrics: #{status}"}

      _ ->
        {:error, "Unknown error"}
    end
  end

  @doc """
  Get the relevant metrics for a given period of time, in a timeseries
  in days

  https://plausible.io/docs/stats-api#get-apiv1statstimeseries
  """
  @doc since: "4.2.0"
  @spec get_timeseries_metrics(Tenant.t(), String.t(), String.t(), String.t()) ::
          {:ok, map()} | {:error, any()}
  def get_timeseries_metrics(tenant, period, date, metric) do
    metric_string = to_string(metric)

    identifier = Urls.get_tenant_identifier(tenant)

    with client when not is_nil(client) <- create_stats_client(identifier),
         {:ok, %{body: %{"results" => results}, status: status}} when status < 400 <-
           Tesla.get(client, "/timeseries",
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

      {_, %{status: status, body: body}} ->
        Logger.error("Failed to get timeseries metrics: (#{status}) #{inspect(body)}")
        {:error, "Failed to get timeseries metrics: #{status}"}

      _ ->
        {:error, "Unknown error"}
    end
  end

  @doc """
  Get a breakdown of a given property over a period of time,
  eg what devices were used or where the users came from.

  For a list of properties, see https://plausible.io/docs/stats-api#properties

  API documentation: https://plausible.io/docs/stats-api#get-apiv1statsbreakdown
  """
  @doc since: "5.0.0"
  @spec get_breakdown_metrics(
          Tenant.t(),
          period :: String.t(),
          date :: String.t(),
          property :: String.t(),
          metrics :: list(String.t() | :atom)
        ) ::
          {:ok, list(map())} | {:error, any()}
  def get_breakdown_metrics(tenant, period, date, property, metrics) do
    metrics = Enum.map(metrics, &to_string/1)
    combined_metrics_string = Enum.join(metrics, ",")
    property_string = to_string(property)

    identifier = Urls.get_tenant_identifier(tenant)

    with client when not is_nil(client) <- create_stats_client(identifier),
         {:ok, [category: prop_category, name: prop_name]} <- parse_property(property_string),
         {:ok, %{body: %{"results" => results}, status: status}} when status < 400 <-
           Tesla.get(client, "/breakdown",
             query: [
               period: period,
               date: date,
               metrics: combined_metrics_string,
               property: "#{prop_category}:#{prop_name}"
             ]
           ) do
      {:ok,
       Enum.map(results, fn %{^prop_name => property} = metrics_map ->
         %{
           property: property,
           metrics:
             Enum.map(metrics, fn metric_name ->
               %{
                 metric: String.to_existing_atom(metric_name),
                 value: Map.get(metrics_map, to_string(metric_name))
               }
             end)
         }
       end)}
    else
      nil ->
        {:error, "Analytics is not enabled"}

      {_, %{status: status, body: body}} ->
        Logger.error("Failed to get breakdown metrics: (#{status}) #{inspect(body)}")
        {:error, "Failed to get breakdown metrics: (#{status})"}

      {:error, _error} = error ->
        error

      _ ->
        {:error, "Unknown error"}
    end
  end

  @spec create_site(Tenant.t()) :: :ok | {:error, String.t()}
  def create_site(tenant) do
    site_id = Urls.get_tenant_identifier(tenant)
    params = %{domain: site_id, timezone: "Europe/Berlin"}

    with client when not is_nil(client) <- create_sites_client(),
         {:ok, %{status: status}} when status < 400 <-
           Tesla.post(
             client,
             "/",
             URI.encode_query(params),
             headers: [{"Content-Type", "application/x-www-form-urlencoded"}]
           ) do
      :ok
    else
      nil ->
        {:error, "Analytics is not enabled"}

      {_, %{status: status, body: body}} ->
        Logger.error("Failed to create plausible site: (#{status}) #{inspect(body)}")
        {:error, "Failed to create plausible site: (#{status})"}

      {:error, _error} = error ->
        error

      _ ->
        {:error, "Unknown error"}
    end
  end

  @spec delete_site(Tenant.t()) :: :ok | {:error, String.t()}
  def delete_site(tenant) do
    site_id = Urls.get_tenant_identifier(tenant)

    with client when not is_nil(client) <- create_sites_client(),
         {:ok, %{status: status}} when status < 400 <-
           Tesla.delete(client, site_id) do
      :ok
    else
      nil ->
        {:error, "Analytics is not enabled"}

      {_, %{status: status, body: body}} ->
        Sentry.capture_message("Failed to delete plausible site: (#{status}) #{inspect(body)}")
        Logger.error("Failed to delete plausible site: (#{status}) #{inspect(body)}")
        {:error, "Failed to delete plausible site: (#{status})"}

      {:error, error_message} = error ->
        Logger.error("Failed to delete plausible site: #{inspect(error_message)}")
        Sentry.capture_message("Failed to delete plausible site: #{inspect(error_message)}")
        error

      _ ->
        {:error, "Unknown error"}
    end
  end

  @spec create_stats_client(site_id :: String.t()) :: Tesla.Client.t() | nil
  defp create_stats_client(side_id), do: create_base_client("/api/v1/stats", site_id: side_id)

  @spec create_sites_client() :: Tesla.Client.t() | nil
  defp create_sites_client(), do: create_base_client("/api/v1/sites")

  @spec create_base_client(path :: String.t(), args :: [{:site_id, number()}]) ::
          Tesla.Client.t() | nil
  defp create_base_client(path, args \\ []) do
    endpoint = config(:endpoint)
    api_key = config(:api_key)

    unless is_nil(endpoint) or is_nil(api_key) do
      query_params =
        args
        |> Keyword.take([:site_id])

      middleware = [
        {Tesla.Middleware.BaseUrl, config(:endpoint) <> path},
        {Tesla.Middleware.Query, query_params},
        Tesla.Middleware.PathParams,
        {Tesla.Middleware.BearerAuth, token: config(:api_key)},
        Tesla.Middleware.JSON
      ]

      Lotta.Tesla.create_client(middleware)
    end
  end

  defp parse_property(<<c::binary-size(5), "_", n::binary>>),
    do: {:ok, [category: c, name: n]}

  defp parse_property(n),
    do: {:error, "Property name '#{n}' is not valid."}

  defp config(key), do: Keyword.get(config(), key)

  defp config() do
    Application.fetch_env!(:lotta, :analytics)
  end
end
