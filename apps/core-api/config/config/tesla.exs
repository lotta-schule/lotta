import Config

adapter =
  case config_env() do
    :test -> Tesla.Mock
    _ -> {Tesla.Adapter.Finch, name: Lotta.Finch}
  end

config :tesla, adapter: adapter

log_level_fn =
  case config_env() do
    :dev ->
      :debug

    _ ->
      fn
        %{status: status} when status <= 399 -> :info
        %{status: status} when status in 400..499 -> :warn
        %{status: status} when status >= 500 -> :info
      end
  end

config :tesla, Tesla.Middleware.Logger,
  filter_headers: ["authorization", "cookie", "set-cookie"],
  log_level: log_level_fn,
  debug: config_env() == :dev
