import Config

config :lotta, Oban,
  engine: Oban.Engines.Basic,
  notifier: Oban.Notifiers.PG,
  repo: Lotta.Repo,
  prefix: "oban",
  queues: [
    file_conversion: [limit: 3],
    media_conversion: [limit: 1],
    preview_generation: [limit: 2],
    file_metadata: [limit: 1]
  ]

if Mix.env() == :test do
  config :lotta, Oban, testing: :inline
end
