import Config

config :lotta, Oban,
  engine: Oban.Engines.Basic,
  notifier: Oban.Notifiers.PG,
  repo: Lotta.Repo,
  prefix: "oban",
  plugins: [
    {Oban.Plugins.Lifeline, rescue_after: :timer.minutes(30)},
    {Oban.Plugins.Pruner, interval: :timer.minutes(30), max_age: :timer.hours(12)},
    {Oban.Plugins.Reindexer, schedule: "@weekly"},
    {Oban.Plugins.Cron,
     crontab: [
       {"0 2 * * *", Lotta.Worker.Tenant, args: %{"type" => "collect_daily_usage_logs"}}
     ]}
  ]

if Mix.env() == :test do
  config :lotta, Oban, testing: :inline
end
