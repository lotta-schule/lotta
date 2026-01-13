import Config

{ip, port} =
  case config_env() do
    :dev -> {{0, 0, 0, 0}, 4010}
    :test -> {{127, 0, 0, 1}, 4011}
    :prod -> {{0, 0, 0, 0, 0, 0, 0, 0}, 4010}
  end

config :lotta, CockpitWeb.Endpoint,
  adapter: Bandit.PhoenixAdapter,
  http: [ip: ip, port: port],
  url: [host: "localhost"],
  render_errors: [
    formats: [html: CockpitWeb.ErrorHTML],
    layout: false
  ],
  pubsub_server: Lotta.PubSub,
  live_view: [signing_salt: "abcdefghijklmnopqrstuvwxyz1234567890"],
  debug_errors: config_env() == :dev,
  code_reloader: config_env() == :dev,
  check_origin: config_env() != :dev

config :lotta, :zammad, []
