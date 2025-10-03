import Config

format =
  case config_env() do
    :test -> "[$level] $message\n"
    :dev -> "[$level] $message\n"
    _ -> "$time $metadata[$level] $message\n"
  end

level =
  case config_env() do
    :dev -> :debug
    _ -> :warning
  end

config :logger, :console,
  format: format,
  level: level,
  metadata: [:request_id, :trace_id, :span_id],
  backends: [:console, Sentry.LoggerBackend]

config :lotta, :logger, [
  {:handler, :sentry, Sentry.LoggerHandler,
   %{
     config: %{
       metadata: [:file, :line, :request_id, :trace_id, :span_id],
       rate_limiting: [max_events: 10, interval: _1_second = 1_000],
       capture_log_messages: true,
       level: :error
     }
   }}
]
