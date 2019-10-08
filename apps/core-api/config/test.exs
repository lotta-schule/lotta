import Config

db_host = case System.get_env("CI") do
  nil -> "postgres"
  _ -> "127.0.0.1"
end
rabbitmq_host = case System.get_env("CI") do
  nil -> "rabbitmq"
  _ -> "127.0.0.1"
end

# Configure your database
config :api, Api.Repo,
  username: "lotta",
  password: "lotta",
  database: "api_test",
  hostname: db_host,
  pool: Ecto.Adapters.SQL.Sandbox

config :api, :rabbitmq_connection,
  username: "guest",
  password: "guest",
  host: rabbitmq_host

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :api, ApiWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn