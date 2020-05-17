import Config

# gitlab-runner k8s executor does not resolve hosts
db_host = case System.get_env("CI") do
  nil -> "postgres"
  _ -> "127.0.0.1"
end
rabbitmq_host = case System.get_env("CI") do
  nil -> "rabbitmq"
  _ -> "127.0.0.1"
end
redis_host = case System.get_env("CI") do
  nil -> "redis"
  _ -> "127.0.0.1"
end
elasticsearch_host = case System.get_env("CI") do
  nil -> "elasticsearch"
  _ -> "127.0.0.1"
end
db_host = "127.0.0.1"
rabbitmq_host = "127.0.0.1"
redis_host = "127.0.0.1"
elasticsearch_host = "127.0.0.1"

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

config :api, :redis_connection,
  host: redis_host,
  password: "lotta",
  name: :redix,
  timeout: 15000

config :api, Api.Guardian,
  issuer: "lotta",
  secret_key: "JM1gXuiWLLO766ayWjaee4Ed/8nmwssLoDbmtt0+yct7jO8TmFsCeOQhDcqQ+v2D"

config :api, Api.Elasticsearch.Cluster,
  url: "http://#{elasticsearch_host}:9200"

config :api, :base_url,
  ".medienportal.lvh.me:3000"

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :api, ApiWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn