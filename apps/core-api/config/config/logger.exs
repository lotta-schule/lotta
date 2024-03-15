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
  metadata: [:request_id],
  backends: [:console, Sentry.LoggerBackend]
