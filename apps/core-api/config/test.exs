import Config

# gitlab-runner k8s executor does not resolve hosts
db_host =
  case System.get_env("CI") do
    nil -> "postgres"
    _ -> "127.0.0.1"
  end

rabbitmq_host =
  case System.get_env("CI") do
    nil -> "rabbitmq"
    _ -> "127.0.0.1"
  end

redis_host =
  case System.get_env("CI") do
    nil -> "redis"
    _ -> "127.0.0.1"
  end

elasticsearch_host =
  case System.get_env("CI") do
    nil -> "elasticsearch"
    _ -> "127.0.0.1"
  end

db_host = "postgres"
rabbitmq_host = "rabbitmq"
redis_host = "redis"
elasticsearch_host = "elasticsearch"

# Configure your database
config :api, Api.Repo,
  username: "lotta",
  password: "lotta",
  database: "api_test",
  hostname: db_host,
  prefix: "public",
  after_connect: {Api.Repo, :after_connect, ["public"]},
  ownership_timeout: 60_000,
  timeout: 60_000,
  pool: Ecto.Adapters.SQL.Sandbox

config :api, :default_configuration, %{
  slug: "web",
  title: "Web Beispiel",
  custom_theme: %{}
}

config :api, :rabbitmq,
  url: "amqp://guest:guest@#{rabbitmq_host}",
  prefix: "test"

config :api, :redis_connection,
  host: redis_host,
  password: "lotta",
  name: :redix,
  timeout: 15000

config :ex_aws, :s3,
  http_client: ExAws.Request.Hackney,
  access_key_id: System.get_env("UGC_S3_COMPAT_ACCESS_KEY_ID", ""),
  secret_access_key: System.get_env("UGC_S3_COMPAT_SECRET_ACCESS_KEY", ""),
  host: %{"fra1" => System.get_env("UGC_S3_COMPAT_ENDPOINT", "")},
  region: "fra1",
  scheme: "https://"

config :api, Api.Mailer, adapter: Bamboo.TestAdapter

config :ex_aws, :hackney_opts,
  follow_redirect: true,
  recv_timeout: 45_000

config :api, ApiWeb.Auth.AccessToken,
  issuer: "lotta",
  secret_key: "JM1gXuiWLLO766ayWjaee4Ed/8nmwssLoDbmtt0+yct7jO8TmFsCeOQhDcqQ+v2D"

config :api, Api.Elasticsearch.Cluster, url: "http://#{elasticsearch_host}:9200"

config :api, :hostname, "lotta.web"

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :api, ApiWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn
