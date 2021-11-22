# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :lotta, :environment, Mix.env()

config :lotta,
  ecto_repos: [Lotta.Repo]

config :lotta, :base_uri,
  host: "lotta.schule",
  scheme: "https"

config :lotta, Lotta.Repo, start_apps_before_migration: [:httpoison]

config :lotta, :live_view,
  username: "admin",
  password: "password"

# Configures the endpoints
config :lotta, LottaWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "FD8SUUCERwNAgJwXIkOt4cGC4FFe1WHhmG2KBj4xgsgafzMqJgUO8yTGsNkCHG2B",
  render_errors: [view: LottaWeb.ErrorView, accepts: ~w(json)],
  pubsub_server: Lotta.PubSub,
  live_view: [signing_salt: "abcdefghijklmnopqrstuvwxyz1234567890"]

config :lotta, Lotta.Elasticsearch.Cluster,
  url: "http://localhost:9200",
  api: Elasticsearch.API.HTTP,
  json_library: Poison,
  indexes: %{
    articles: %{
      settings: "priv/elasticsearch/articles.json",
      store: Lotta.Elasticsearch.Store,
      sources: [Lotta.Content.Article],
      bulk_page_size: 150,
      bulk_wait_interval: 20_000
    }
  },
  default_options: [
    timeout: 10_000,
    recv_timeout: 5_000,
    hackney: [pool: :elasticsearch_pool]
  ]

config :lotta, Lotta.Mailer, default_sender: "mail@lotta.schule"

config :lotta, LottaWeb.Auth.AccessToken,
  issuer: "lotta",
  secret_key: "JM1gXuiWLLO766ayWjaee4Ed/8nmwssLoDbmtt0+yct7jO8TmFsCeOQhDcqQ+v2D"

config :lotta, :default_user, %{
  name: "Max Mustermann",
  email: "maxmustermann@lotta.schule",
  hide_full_name: false
}

config :argon2_elixir,
  argon2_type: 1

config :sentry,
  filter: Lotta.SentryFilter,
  included_environments: ~w(production staging),
  environment_name: Atom.to_string(Mix.env()),
  enable_source_code_context: true,
  root_source_code_paths: [File.cwd!()]

# Configures Elixir's Logger
config :logger,
  backends: [:console, Sentry.LoggerBackend]

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# set standard locale
config :gettext, :default_locale, "de"

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"

config :lager,
  error_logger_redirect: false,
  handlers: [level: :critical]
