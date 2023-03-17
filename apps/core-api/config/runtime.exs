import Config

env = System.get_env("APP_ENVIRONMENT")

image_tag =
  case String.split(System.get_env("IMAGE_NAME", ""), ":") do
    [_image, tag] -> tag
    _ -> nil
  end

if env do
  config :lotta, :environment, env
else
  config :lotta, :environment, config_env()
end

if config_env() == :prod do
  config :lotta, :base_uri,
    host: System.get_env("BASE_URI_HOST", "lotta.schule"),
    scheme: "https"

  config :opentelemetry, :resource, service: %{name: System.get_env("SERVICE_NAME", "core")}

  config :opentelemetry, :processors,
    otel_batch_processor: %{
      exporter: {:opentelemetry_exporter, %{endpoints: [{:http, 'tempo.monitoring', 4318, []}]}}
    }

  config :lotta,
         Lotta.Repo,
         username: System.fetch_env!("POSTGRES_USER"),
         password: System.fetch_env!("POSTGRES_PASSWORD"),
         database: System.fetch_env!("POSTGRES_DB"),
         hostname: System.fetch_env!("POSTGRES_HOST"),
         show_sensitive_data_on_connection_error: true,
         pool_size: 10

  config :lotta, :rabbitmq,
    url:
      %URI{
        host: System.get_env("RABBITMQ_HOST"),
        scheme: "amqp",
        userinfo:
          if System.get_env("RABBITMQ_PASSWORD") do
            "#{URI.encode_www_form(System.get_env("RABBITMQ_USER") || "")}:#{URI.encode_www_form(System.get_env("RABBITMQ_PASSWORD"))}"
          else
            System.get_env("RABBITMQ_USER")
          end
      }
      |> URI.to_string()

  config :lotta, :redis_connection,
    host: System.fetch_env!("REDIS_HOST"),
    password: System.fetch_env!("REDIS_PASSWORD"),
    name: :redix

  config :lotta, :schedule_provider_url, System.fetch_env!("SCHEDULE_PROVIDER_URL")

  config :lotta, LottaWeb.Auth.AccessToken, secret_key: System.fetch_env!("SECRET_KEY_JWT")

  config :lotta, Lotta.Elasticsearch.Cluster, url: System.get_env("ELASTICSEARCH_HOST")

  config :lotta, LottaWeb.Endpoint,
    url: [host: System.get_env("HOSTNAME", "core.lotta.schule")],
    http: [:inet6, port: String.to_integer(System.get_env("PORT") || "4000")],
    secret_key_base: System.fetch_env!("SECRET_KEY_BASE"),
    live_view: [signing_salt: System.fetch_env!("LIVE_VIEW_SALT_SECRET")]

  config :lotta, Lotta.Storage.RemoteStorage,
    default_storage: System.get_env("REMOTE_STORAGE_DEFAULT_STORE"),
    prefix: System.fetch_env!("REMOTE_STORAGE_PREFIX"),
    storages:
      System.get_env("REMOTE_STORAGE_STORES", "")
      |> String.split(",")
      |> Enum.filter(&String.length(&1))
      |> Enum.reduce(%{}, fn storage_name, acc ->
        env_name =
          storage_name
          |> String.upcase()
          |> String.replace("-", "_")

        acc
        |> Map.put(storage_name, %{
          type: Lotta.Storage.RemoteStorage.Strategy.S3,
          config: %{
            endpoint: System.get_env("REMOTE_STORAGE_#{env_name}_ENDPOINT"),
            bucket: System.get_env("REMOTE_STORAGE_#{env_name}_BUCKET")
          }
        })
      end)

  config :lotta, Lotta.Storage.ImageProcessingUrl,
    hosts:
      System.get_env("IMAGE_PROCESSING_HOSTS", "")
      |> String.split(",")
      |> Enum.filter(&String.length(&1))

  config :lotta, Lotta.Mailer,
    adapter: Bamboo.MailgunAdapter,
    api_key: System.get_env("MAILGUN_API_KEY"),
    domain: System.get_env("MAILGUN_DOMAIN"),
    default_sender: System.get_env("MAILER_DEFAULT_SENDER"),
    base_uri: "https://api.eu.mailgun.net/v3"

  config :lotta, LottaWeb.Endpoint, server: true

  config :ex_aws, :s3,
    http_client: ExAws.Request.Hackney,
    host: %{
      System.fetch_env!("UGC_S3_COMPAT_REGION") => System.fetch_env!("UGC_S3_COMPAT_ENDPOINT")
    },
    region: System.fetch_env!("UGC_S3_COMPAT_REGION"),
    scheme: "https://"

  config :lotta, :admin_api_key,
    username: "admin",
    password: System.get_env("COCKPIT_ADMIN_API_KEY", "")

  config :sentry,
    dsn: System.get_env("SENTRY_DSN"),
    environment_name: String.to_atom(env || "development"),
    included_environments: ~w(production staging),
    release: image_tag,
    enable_source_code_context: true,
    root_source_code_paths: [File.cwd!()],
    filter: Lotta.SentryFilter

  config :lager,
    error_logger_redirect: false,
    handlers: [
      level: :info,
      lager_console_backend: [
        format: "$time $metadata[$level] $message"
      ]
    ]

  config :logger,
    backends: [:console, Sentry.LoggerBackend],
    level: :warn,
    compile_time_purge_level: :info,
    format: "$time $metadata[$level] $message\n",
    metadata: [:request_id]
end
