import Config

app_environment =
  case System.get_env("APP_ENVIRONMENT") do
    "production" -> :production
    "staging" -> :staging
    _ -> Mix.env()
  end

image_tag =
  case String.split(System.get_env("IMAGE_NAME", ""), ":") do
    [_image, tag] -> tag
    _ -> nil
  end

config :lotta, :environment, app_environment || config_env()

if config_env() == :prod do
  base_uris = String.split(System.get_env("BASE_URI_HOST", "lotta.schule"), ",")

  config :lotta, :base_uri,
    host: List.first(base_uris),
    alias: Enum.slice(base_uris, 1, Enum.count(base_uris) - 1),
    scheme: "https"

  config :opentelemetry, :resource,
    service: %{
      name: System.get_env("SERVICE_NAME", "core"),
      namespace: System.get_env("SERVICE_NAME")
    }

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

  # The secret key base is used to sign/encrypt cookies and other secrets.
  # A default value is used in config/dev.exs and config/test.exs but you
  # want to use a different value for prod and you most likely don't want
  # to check this value into version control, so we use an environment
  # variable instead.
  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  config :lotta, LottaWeb.Endpoint,
    http: [
      # Enable IPv6 and bind on all interfaces.
      # Set it to  {0, 0, 0, 0, 0, 0, 0, 1} for local network only access.
      # See the documentation on https://hexdocs.pm/plug_cowboy/Plug.Cowboy.html
      # for details about using IPv6 vs IPv4 and loopback vs public addresses.
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: String.to_integer(System.get_env("PORT") || "4000")
    ],
    secret_key_base: secret_key_base

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
    cloudimage_token: System.get_env("CLOUDIMAGE_TOKEN")

  config :lotta, Lotta.Mailer,
    adapter: Bamboo.MailgunAdapter,
    api_key: System.get_env("MAILGUN_API_KEY"),
    domain: System.get_env("MAILGUN_DOMAIN"),
    default_sender: System.get_env("MAILER_DEFAULT_SENDER"),
    feedback_sender: System.get_env("MAILER_FEEDBACK_SENDER"),
    base_uri: "https://api.eu.mailgun.net/v3"

  config :lotta, LottaWeb.Endpoint, server: true

  config :ex_aws, :s3,
    http_client: ExAws.Request.Hackney,
    host: %{
      System.fetch_env!("UGC_S3_COMPAT_REGION") =>
        String.replace_prefix(System.fetch_env!("UGC_S3_COMPAT_ENDPOINT"), "https://", "")
    },
    region: System.fetch_env!("UGC_S3_COMPAT_REGION"),
    scheme: "https://"

  config :lotta, :admin_api_key,
    username: "admin",
    password: System.get_env("COCKPIT_ADMIN_API_KEY", "")

  config :sentry,
    dsn: System.get_env("SENTRY_DSN"),
    environment_name: to_string(app_environment),
    included_environments: ~w(production staging),
    release: image_tag,
    enable_source_code_context: true,
    root_source_code_paths: [File.cwd!()],
    filter: Lotta.SentryFilter
end

config :lotta, Lotta.Notification.Provider.APNS,
  adapter: Pigeon.APNS,
  key: System.get_env("APNS_KEY"),
  key_identifier: System.get_env("APNS_KEY_ID"),
  team_id: System.get_env("APNS_TEAM_ID"),
  topic: System.get_env("APNS_TOPIC", "net.einsa.lotta"),
  mode: if(config_env() == :prod, do: :prod, else: :dev)

config :lotta, Lotta.Notification.Provider.FCM,
  adapter: Pigeon.FCM,
  project_id: System.get_env("FCM_PROJECT_ID"),
  service_account_json: System.get_env("FCM_SERVICE_ACCOUNT_JSON")
