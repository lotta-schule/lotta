# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :lotta,
  ecto_repos: [Lotta.Repo]

config :lotta, :base_uri,
  host: "lotta.schule",
  scheme: "https"

config :lotta, Lotta.Repo, start_apps_before_migration: [:httpoison]

# Configures the endpoints
config :lotta, LottaWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [view: LottaWeb.ErrorView, accepts: ~w(json)],
  pubsub_server: Lotta.PubSub,
  live_view: [signing_salt: "abcdefghijklmnopqrstuvwxyz1234567890"]

config :sentry,
  included_environments: []

config :lotta, Lotta.Mailer, default_sender: "mail@lotta.schule"

config :lotta, LottaWeb.Auth.AccessToken,
  issuer: "lotta",
  secret_key: "JM1gXuiWLLO766ayWjaee4Ed/8nmwssLoDbmtt0+yct7jO8TmFsCeOQhDcqQ+v2D"

config :lotta, :default_user, %{
  name: "Max Mustermann",
  email: "maxmustermann@lotta.schule",
  hide_full_name: false
}

config :absinthe_graphql_ws, :json_library, Jason

config :argon2_elixir,
  argon2_type: 1

config :tesla, adapter: Tesla.Adapter.Hackney

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id],
  backends: [:console, Sentry.LoggerBackend]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# set standard locale
config :gettext, :default_locale, "de"

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
