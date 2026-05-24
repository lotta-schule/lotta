import Config

json_logging = config_env() not in [:dev, :test]

IO.inspect(config_env(), label: "Config environment")

default_log_level =
  cond do
    json_logging -> :warn
    config_env() == :test -> :warn
    true -> :debug
  end

metadata_keys = [
  :version,
  :env,
  :application,
  :registered_name,
  :initial_call,
  :pid,
  :mfa,
  :module,
  :function,
  :file,
  :line,
  :domain,
  :crash_reason,
  :error,
  :reason,
  :tenant_id,
  :tenant_slug,
  :tenant_prefix,
  :user_id,
  :request_id,
  :message_id,
  :conversation_id
]

config :logger,
  handle_otp_reports: true,
  handle_sasl_reports: true

config :logger_json, encoder: JSON

if not json_logging do
  config :logger, level: default_log_level

  config :logger, :default_formatter,
    format: "[$level] $message\n",
    metadata: metadata_keys
else
  config :logger, :default_handler,
    formatter: {LoggerJSON.Formatters.Basic, [metadata: metadata_keys, level: default_log_level]}
end
