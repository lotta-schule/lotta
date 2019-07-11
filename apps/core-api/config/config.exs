# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :api,
  ecto_repos: [Api.Repo]

# Configures the endpoint
config :api, ApiWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "FD8SUUCERwNAgJwXIkOt4cGC4FFe1WHhmG2KBj4xgsgafzMqJgUO8yTGsNkCHG2B",
  render_errors: [view: ApiWeb.ErrorView, accepts: ~w(json)],
  pubsub: [name: Api.PubSub, adapter: Phoenix.PubSub.PG2]

config :api, Api.Guardian,
  issuer: "medienportal",
  secret_key: System.get_env("SECRET_KEY_JWT")

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

config :ex_aws, :s3,
  http_client: ExAws.Request.Hackney,
  access_key_id: System.get_env("UGC_S3_COMPAT_ACCESS_KEY_ID"),
  secret_access_key: System.get_env("UGC_S3_COMPAT_SECRET_ACCESS_KEY"),
  host: %{System.get_env("UGC_S3_COMPAT_REGION") => System.get_env("UGC_S3_COMPAT_ENDPOINT")},
  region: System.get_env("UGC_S3_COMPAT_REGION"),
  scheme: "https://"

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
