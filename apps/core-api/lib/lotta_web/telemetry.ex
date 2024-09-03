defmodule LottaWeb.Telemetry do
  @moduledoc """
  Telemetry events for LottaWeb.
  """
  use Supervisor

  import Telemetry.Metrics

  alias Lotta.Administration

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
      {TelemetryMetricsPrometheus, metrics: metrics(), port: 9568, name: :lotta_prometheus}
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

      # # Absinthe Metrics
      # summary("absinthe.execute.operation.stop.duration",
      #   tag_values: fn %{metadata: %{options: options}} ->
      #     Enum.into(options, %{})
      #   end,
      #   unit: {:native, :millisecond}
      # ),

      # Ecto Metrics
      summary("lotta.repo.query.total_time", unit: {:native, :millisecond}),
      summary("lotta.repo.query.decode_time", unit: {:native, :millisecond}),
      summary("lotta.repo.query.query_time", unit: {:native, :millisecond}),
      summary("lotta.repo.query.queue_time", unit: {:native, :millisecond}),
      summary("lotta.repo.query.idle_time", unit: {:native, :millisecond}),

      # Custom Metrics
      last_value("lotta.tenant_count.count"),
      counter("lotta.push_notification.message_sent.sent.system_time",
        tag_values: fn %{
                         tenant: tenant,
                         user: user,
                         message: message,
                         conversation: conversation,
                         notification: notification
                       } ->
          %{
            tenant_id: tenant.id,
            tenant_slug: tenant.slug,
            user_id: user.id,
            message_id: message.id,
            conversation_id: conversation.id,
            notification_id: notification.id
          }
        end
      )
    ]
  end

  defp periodic_lotta_measurements,
    do: [
      {__MODULE__, :dispatch_tenant_count, []}
    ]

  def dispatch_tenant_count do
    :telemetry.execute(
      [:lotta, :tenant_count],
      %{count: Lotta.Administration.Measurements.count_tenants()}
    )
  end
end
