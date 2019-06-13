# In this file, we load production configuration and
# secrets from environment variables. You can also
# hardcode secrets, although such is generally not
# recommended and you have to remember to add this
# file to your .gitignore.
use Mix.Config

config :api, Api.Repo,
  # ssl: true,
  # database: System.get_env("POSTGRES_DB"),
  # username: System.get_env("POSTGRES_USER"),
  # password: System.get_env("POSTGRES_PASSWORD"),
  # hostname: System.get_env("POSTGRES_HOST"),
  show_sensitive_data_on_connection_error: true,
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10")

config :api, ApiWeb.Endpoint,
  http: [:inet6, port: String.to_integer(System.get_env("PORT") || "4000")],
  secret_key_base: System.get_env("SECRET_KEY_BASE")
