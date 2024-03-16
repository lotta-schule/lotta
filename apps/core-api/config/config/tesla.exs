import Config

adapter =
  case config_env() do
    :test -> Tesla.Mock
    _ -> Tesla.Adapter.Hackney
  end

config :tesla, adapter: adapter
