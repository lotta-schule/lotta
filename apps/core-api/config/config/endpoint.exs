import Config

{ip, port} =
  case config_env() do
    :dev -> {{127, 0, 0, 1}, 4000}
    :test -> {{127, 0, 0, 1}, 4001}
    :prod -> {{0, 0, 0, 0, 0, 0, 0, 0}, 4000}
  end

server =
  case config_env() do
    :test -> false
    _ -> true
  end

config :lotta, LottaWeb.Endpoint,
  http: [ip: ip, port: port],
  server: server,
  url: [host: "localhost"],
  render_errors: [view: LottaWeb.ErrorView, accepts: ~w(json)],
  pubsub_server: Lotta.PubSub,
  live_view: [signing_salt: "abcdefghijklmnopqrstuvwxyz1234567890"],
  debug_errors: config_env() == :dev,
  code_reloader: config_env() == :dev,
  check_origin: config_env() != :dev
