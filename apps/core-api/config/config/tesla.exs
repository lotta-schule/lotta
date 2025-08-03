import Config

adapter =
  case config_env() do
    :test -> Tesla.Mock
    _ -> {Tesla.Adapter.Finch, name: Lotta.Finch}
  end

config :tesla, adapter: adapter

config :tesla, Tesla.Middleware.Logger,
  filter_headers: ["authorization", "cookie", "set-cookie"],
  debug: config_env() == :dev
