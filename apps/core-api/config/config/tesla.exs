import Config

adapter =
  case config_env() do
    :test -> Tesla.Mock
    _ -> {Tesla.Adapter.Finch, name: Lotta.Finch}
  end

config :tesla, adapter: adapter
