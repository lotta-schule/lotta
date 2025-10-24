import Config

if config_env() == :test do
  config :opentelemetry, traces_exporter: :none
  config :opentelemetry, :resource, []
  config :opentelemetry, :processors, []
  config :lotta, LottaWeb.Telemetry, prometheus_config: [port: 9567]
end
