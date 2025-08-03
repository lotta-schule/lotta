import Config

config :oauth2,
  adapter: Application.get_env(:tesla, :adapter),
  middleware: [
    Tesla.Middleware.OpenTelemetry,
    Tesla.Middleware.FollowRedirects,
    Tesla.Middleware.Logger
  ],
  debug: config_env() != :prod
