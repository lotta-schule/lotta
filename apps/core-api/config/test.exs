import Config

# Configure your database
config :api, Api.Repo,
  username: "lotta",
  password: "lotta",
  database: "api_test",
  hostname: "postgres",
  pool: Ecto.Adapters.SQL.Sandbox

config :api, :rabbitmq_connection,
  username: "guest",
  password: "guest",
  host: "rabbitmq"

config :api, Api.Guardian,
  issuer: "lotta",
  secret_key: "JM1gXuiWLLO766ayWjaee4Ed/8nmwssLoDbmtt0+yct7jO8TmFsCeOQhDcqQ+v2D"

config :api, :base_url,
  ".medienportal.lvh.me:3000"

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :api, ApiWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn