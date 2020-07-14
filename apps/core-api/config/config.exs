# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :api,
  ecto_repos: [Api.Repo]

config :api, Api.Repo, start_apps_before_migration: [:httpoison]

# Configures the endpoint
config :api, ApiWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "FD8SUUCERwNAgJwXIkOt4cGC4FFe1WHhmG2KBj4xgsgafzMqJgUO8yTGsNkCHG2B",
  render_errors: [view: ApiWeb.ErrorView, accepts: ~w(json)],
  pubsub_server: [name: Api.PubSub],
  live_view: [signing_salt: "FD8SUUCERwNAgJwXIkOt4cGC4FFe1WHhmG2KBj4xgsgafzMqJgUO8yTGsNkCHG2B"]

config :api, Api.Elasticsearch.Cluster,
  url: "http://elasticsearch:9200",
  api: Elasticsearch.API.HTTP,
  json_library: Poison,
  indexes: %{
    articles: %{
      settings: "priv/elasticsearch/articles.json",
      store: Api.Elasticsearch.Store,
      sources: [Api.Content.Article],
      bulk_page_size: 150,
      bulk_wait_interval: 20_000
    }
  },
  default_options: [
    timeout: 10_000,
    recv_timeout: 5_000,
    hackney: [pool: :elasticsearch_pool]
  ]

config :api, Api.Guardian,
  issuer: "lotta",
  key: "lta_auth"

# Configures Elixir's Logger
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
