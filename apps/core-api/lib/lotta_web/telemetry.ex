defmodule LottaWeb.Telemetry do
  @moduledoc """
  Telemetry events for LottaWeb.
  """
  use Supervisor

  import Telemetry.Metrics

  def start_link(arg) do
    Supervisor.start_link(__MODULE__, arg, name: __MODULE__)
  end

  def init(_init_arg) do
    children = [
      {:telemetry_poller,
       measurements: periodic_lotta_measurements(),
       period: :timer.hours(1),
       init_delay: :timer.minutes(5),
       name: :lotta_lotta_telemetry_poller},
      {TelemetryMetricsPrometheus,
       Keyword.merge(
         [metrics: metrics(), port: 9568, name: :lotta_prometheus],
         get_config(:prometheus_config)
       )}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  def metrics do
    [
      # VM Metrics
      summary("vm.memory.total", unit: {:byte, :kilobyte}),
      summary("vm.total_run_queue_lengths.total"),
      summary("vm.total_run_queue_lengths.cpu"),
      summary("vm.total_run_queue_lengths.io"),

      # TelemetryMetricsPrometheus itself's metrics
      distribution("prometheus_metrics.scrape.duration.milliseconds",
        reporter_options: [buckets: [0.05, 0.1, 0.2, 0.5, 1]],
        description: "A histogram of the request duration for prometheus metrics scrape.",
        event_name: [:prometheus_metrics, :plug, :stop],
        measurement: :duration,
        tags: [:name],
        tag_values: fn %{conn: conn} ->
          %{name: conn.private[:prometheus_metrics_name]}
        end,
        unit: {:native, :millisecond}
      ),

      # Phoenix Metrics
      summary("phoenix.endpoint.stop.duration",
        unit: {:native, :millisecond}
      ),
      summary("phoenix.router_dispatch.stop.duration",
        tags: [:route],
        unit: {:native, :millisecond}
      ),

      # Absinthe Metrics
      distribution("absinthe.execute.operation.stop.duration",
        unit: {:native, :millisecond},
        tags: [:operation_name, :operation_type],
        tag_values: &absinthe_operation_tags/1,
        reporter_options: [buckets: [10, 50, 100, 250, 500, 1_000, 2_500, 5_000]]
      ),

      # Ecto Metrics
      summary("lotta.repo.query.total_time", unit: {:native, :millisecond}),
      summary("lotta.repo.query.decode_time", unit: {:native, :millisecond}),
      summary("lotta.repo.query.query_time", unit: {:native, :millisecond}),
      summary("lotta.repo.query.queue_time", unit: {:native, :millisecond}),
      summary("lotta.repo.query.idle_time", unit: {:native, :millisecond}),

      # Same as above, tagged by table (`:source` in Ecto's telemetry metadata)
      # for a "slowest tables" panel. Cardinality is bounded by the (small,
      # fixed) number of DB tables, unlike tenant-level tagging — see
      # docs/observability-improvements.md for why tenant tagging was not
      # added here.
      summary("lotta.repo.query.total_time.by_source",
        event_name: [:lotta, :repo, :query],
        measurement: :total_time,
        tags: [:source],
        unit: {:native, :millisecond}
      ),

      # Oban Metrics
      distribution("oban.job.stop.duration",
        unit: {:native, :millisecond},
        tags: [:queue, :worker, :state],
        tag_values: &oban_job_tags/1,
        reporter_options: [buckets: [10, 100, 500, 1_000, 5_000, 10_000, 30_000, 60_000]]
      ),
      counter("oban.job.stop.count",
        tags: [:queue, :worker, :state],
        tag_values: &oban_job_tags/1
      ),
      counter("oban.job.exception.count",
        tags: [:queue, :worker, :state],
        tag_values: &oban_job_tags/1
      ),

      # Custom Metrics
      last_value("lotta.tenant_count.count"),
      last_value("lotta.active_tenant_count.count"),
      last_value("lotta.active_user_count.count"),
      last_value("lotta.total_storage_bytes.count"),
      counter("lotta.push_notification.message_sent.sent.system_time",
        tag_values: fn %{
                         tenant: tenant,
                         user: user,
                         message: message,
                         conversation: conversation
                       } ->
          %{
            tenant_id: tenant.id,
            tenant_slug: tenant.slug,
            user_id: user.id,
            message_id: message.id,
            conversation_id: conversation.id
          }
        end
      )
    ]
  end

  defp oban_job_tags(%{job: job, state: state}) do
    %{queue: job.queue, worker: job.worker, state: state}
  end

  defp absinthe_operation_tags(%{blueprint: blueprint}) do
    case Absinthe.Blueprint.current_operation(blueprint) do
      %{name: name, type: type} -> %{operation_name: name || "anonymous", operation_type: type}
      nil -> %{operation_name: "unknown", operation_type: "unknown"}
    end
  end

  defp periodic_lotta_measurements,
    do: [
      {__MODULE__, :dispatch_tenant_count, []},
      {__MODULE__, :dispatch_active_tenant_count, []},
      {__MODULE__, :dispatch_active_user_count, []},
      {__MODULE__, :dispatch_total_storage_bytes, []}
    ]

  def dispatch_tenant_count do
    :telemetry.execute(
      [:lotta, :tenant_count],
      %{count: Lotta.Administration.Measurements.count_tenants()}
    )
  end

  def dispatch_active_tenant_count do
    :telemetry.execute(
      [:lotta, :active_tenant_count],
      %{count: Lotta.Administration.Measurements.count_active_tenants()}
    )
  end

  def dispatch_active_user_count do
    :telemetry.execute(
      [:lotta, :active_user_count],
      %{count: Lotta.Administration.Measurements.count_active_users()}
    )
  end

  def dispatch_total_storage_bytes do
    :telemetry.execute(
      [:lotta, :total_storage_bytes],
      %{count: Lotta.Administration.Measurements.total_storage_bytes()}
    )
  end

  defp get_config(key) do
    Keyword.get(config(), key, [])
  end

  defp config() do
    Application.get_env(:lotta, __MODULE__, [])
  end
end
