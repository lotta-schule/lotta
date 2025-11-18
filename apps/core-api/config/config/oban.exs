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
       {"0 2 * * *", Lotta.Worker.Tenant, args: %{"type" => "collect_daily_usage_logs"}},
       # At 03:00 on every day-of-month from 1 through 3 and every day-of-month from 28 through 30 and on Sunday.
       {"0 3 1-3,28-30 * 0,3", Lotta.Worker.Tenant,
        args: %{"type" => "refresh_monthly_usage_logs"}},
       # At 03:45 on day-of-month 2.
       {"45 3 1 * *", Lotta.Worker.Tenant, args: %{"type" => "generate_invoices"}}
     ]}
  ]

if Mix.env() == :test do
  config :lotta, Oban, testing: :inline
end
