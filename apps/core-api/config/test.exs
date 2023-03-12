import Config

# Configure your database
config :lotta, Lotta.Repo,
  username: "lotta",
  password: "lotta",
  database: "api_test",
  hostname: "localhost",
  ownership_timeout: 120_000,
  timeout: 120_000,
  pool: Ecto.Adapters.SQL.Sandbox

config :lotta, :rabbitmq,
  url: "amqp://guest:guest@localhost",
  prefix: "test"

config :lotta, :redis_connection,
  host: "localhost",
  password: "lotta",
  name: :redix,
  timeout: 15000

config :lotta, Lotta.Mailer, adapter: Bamboo.TestAdapter

config :lotta, Lotta.Elasticsearch.Cluster, url: "http://localhost:9200"

config :ex_aws, :s3,
  http_client: ExAws.Request.Hackney,
  access_key_id: "AKIAIOSFODNN7EXAMPLE",
  secret_access_key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  host: "localhost",
  scheme: "http://",
  port: 9000

config :lotta, Lotta.Storage.RemoteStorage,
  default_storage: "minio",
  storages: %{
    "minio" => %{
      type: Lotta.Storage.RemoteStorage.Strategy.S3,
      config: %{
        endpoint: "http://localhost:9000",
        bucket: "lotta-dev-ugc"
      }
    }
  }

config :lotta, Lotta.Storage.ImageProcessingUrl, hosts: ["ugc.lotta.schule"]

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :lotta, LottaWeb.Endpoint,
  http: [port: 4002],
  server: false

config :junit_formatter,
  print_report_file: true,
  include_filename?: true,
  include_file_line?: true

# Print only errors during test
config :logger, level: :error
