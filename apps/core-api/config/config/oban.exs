import Config

config :lotta, Oban,
  engine: Oban.Engines.Basic,
  notifier: Oban.Notifiers.PG,
  repo: Lotta.Repo,
  prefix: "oban",
  queues: [
    file_conversion: [limit: 3],
    file_conversion_lazy: [limit: 1]
  ]

if Mix.env() == :test do
  config :lotta, Oban, testing: :manual
end
