import Config

defmodule SystemConfig do
  @allowed_environments ~w(test development staging production)
  def get(envvar, opts \\ []) do
    value = System.get_env(envvar) || default(envvar, config_env())

    case Keyword.get(opts, :cast) do
      nil ->
        value

      :integer ->
        value && String.to_integer(value)

      :environment ->
        (value && Enum.find(@allowed_environments, &(&1 == value))) ||
          raise """
            environment variable #{envvar} has an invalid value: #{value}.
            Must be one of: #{@allowed_environments}
          """

      :boolean ->
        value in ["1", "true", "TRUE", true]

      :url_encode ->
        value && URI.encode_www_form(value)

      :string_list ->
        value && String.split(value, ",")

      :docker_image_tag ->
        value && String.split(value, ":") |> List.last()

      :url_host ->
        value && URI.parse(value).host

      :url_scheme ->
        value && URI.parse(value).scheme

      :bamboo_adapter ->
        case value do
          "mailgun" -> Bamboo.MailgunAdapter
          "local" -> Bamboo.LocalAdapter
          "test" -> Bamboo.TestAdapter
          _ -> raise "Invalid mail adapter: #{value}"
        end
    end
  end

  defp default("POOL_SIZE", _), do: "10"
  defp default("APP_ENVIRONMENT", _), do: "development"
  defp default("BASE_URI_HOST", :dev), do: "lotta.schule,local.lotta.schule,lotta.lvh.me"
  defp default("BASE_URI_HOST", _), do: "lotta.schule"
  defp default("BASE_URI_PORT", :dev), do: "3000"
  defp default("BASE_URI_PORT", _), do: nil
  defp default("BASE_URI_SCHEME", env) when env in [:prod, :test], do: "https"
  defp default("BASE_URI_SCHEME", _), do: "http"
  defp default("RELEASE_NAME", _), do: "lotta"
  defp default("IMAGE_NAME", _), do: ""
  defp default("SERVICE_NAME", _), do: "core"
  defp default("NAMESPACE", _), do: nil
  defp default("SERVER", :test), do: "false"
  defp default("SERVER", _), do: "true"
  defp default("SECRET_KEY_BASE", env) when env in [:dev, :test], do: "123"

  defp default("SECRET_KEY_JWT", env) when env in [:dev, :test],
    do: "JM1gXuiWLLO766ayWjaee4Ed/8nmwssLoDbmtt0+yct7jO8TmFsCeOQhDcqQ+v2D"

  defp default("ISSUER_JWT", _), do: "lotta"

  defp default("PORT", _), do: "4000"

  defp default("POSTGRES_USER", env) when env in [:dev, :test], do: "lotta"
  defp default("POSTGRES_PASSWORD", env) when env in [:dev, :test], do: "lotta"
  defp default("POSTGRES_DB", :test), do: "api_test"
  defp default("POSTGRES_DB", :dev), do: "lotta"
  defp default("POSTGRES_HOST", _), do: "localhost"
  defp default("POSTGRES_POOL_SIZE", _), do: "10"

  defp default("RABBITMQ_HOST", _), do: "localhost"
  defp default("RABBITMQ_USER", _), do: "guest"
  defp default("RABBITMQ_PASSWORD", _), do: "guest"
  defp default("RABBITMQ_PREFIX", :test), do: "test"
  defp default("RABBITMQ_PREFIX", _), do: nil

  defp default("REDIS_HOST", env) when env in [:dev, :test], do: "localhost"
  defp default("REDIS_PASSWORD", env) when env in [:dev, :test], do: "lotta"

  defp default("UGC_S3_COMPAT_ENDPOINT", env) when env in [:dev, :test], do: "http://localhost"
  defp default("UGC_S3_COMPAT_REGION", env) when env in [:dev, :test], do: "us-east-1"
  defp default("UGC_COMPAT_S3_PORT", env) when env in [:dev, :test], do: "9000"

  defp default("AWS_SECRET_ACCESS_KEY", env) when env in [:dev, :test],
    do: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

  defp default("AWS_ACCESS_KEY_ID", env) when env in [:dev, :test], do: "AKIAIOSFODNN7EXAMPLE"

  defp default("REMOTE_STORAGE_DEFAULT_STORE", env) when env in [:dev, :test], do: "minio"
  defp default("REMOTE_STORAGE_PREFIX", _), do: nil
  defp default("REMOTE_STORAGE_STORES", env) when env in [:dev, :test], do: "minio"
  defp default("REMOTE_STORAGE_MINIO_ENDPOINT", _), do: "http://localhost:9000/lotta-dev-ugc"
  defp default("REMOTE_STORAGE_MINIO_BUCKET", _), do: "lotta-dev-ugc"

  defp default("MAILER_ADAPTER", :dev), do: "local"
  defp default("MAILER_ADAPTER", :test), do: "test"
  defp default("MAILER_ADAPTER", _), do: "mailgun"
  defp default("MAILGUN_BASE_URI", _), do: "https://api.eu.mailgun.net/v3"
  defp default("MAILGUN_API_KEY", _), do: nil
  defp default("MAILGUN_DOMAIN", _), do: nil
  defp default("MAILER_DEFAULT_SENDER", env) when env in [:dev, :test], do: "mail@lotta.schule"
  defp default("MAILER_DEFAULT_SENDER", _), do: nil
  defp default("MAILER_FEEDBACK_SENDER", _), do: nil

  defp default("PIGEON_USE_SANDBOX", :test), do: "true"
  defp default("PIGEON_USE_SANDBOX", _), do: "false"
  defp default("APNS_KEY", _), do: nil
  defp default("APNS_KEY_ID", _), do: nil
  defp default("APNS_TEAM_ID", _), do: nil
  defp default("APNS_TOPIC", _), do: "net.einsa.lotta"
  defp default("APNS_USE_PRODUCTION", :prod), do: "true"
  defp default("APNS_USE_PRODUCTION", _), do: false
  defp default("FCM_PROJECT_ID", _), do: nil
  defp default("FCM_SERVICE_ACCOUNT_JSON", _), do: nil

  defp default("COCKPIT_ADMIN_API_USERNAME", _), do: "admin"
  defp default("COCKPIT_ADMIN_API_KEY", env) when env in [:dev, :test], do: "test123"

  defp default("SENTRY_DSN", _), do: nil
  defp default("CLOUDIMAGE_TOKEN", env) when env in [:dev, :test], do: "123"

  defp default("SCHEDULE_PROVIDER_URL", env) when env in [:dev, :test],
    do: "http://localhost:3111"

  defp default(key, env),
    do: raise("environment variable #{key} not set and no default for #{inspect(env)}")
end

config :lotta, :environment, SystemConfig.get("APP_ENVIRONMENT", cast: :environment)

[host | alias] = SystemConfig.get("BASE_URI_HOST", cast: :string_list)

config :lotta, :base_uri,
  host: host,
  alias: alias,
  scheme: SystemConfig.get("BASE_URI_SCHEME"),
  port: SystemConfig.get("BASE_URI_PORT")

# The secret key base is used to sign/encrypt cookies and other secrets.
config :lotta, LottaWeb.Endpoint, secret_key_base: SystemConfig.get("SECRET_KEY_BASE")

config :opentelemetry, :resource,
  service: %{
    name: SystemConfig.get("SERVICE_NAME"),
    namespace: System.get_env("NAMESPACE")
  }

config :opentelemetry, :processors,
  otel_batch_processor: %{
    exporter: {:opentelemetry_exporter, %{endpoints: [{:http, ~c"tempo.monitoring", 4318, []}]}}
  }

config :lotta,
       Lotta.Repo,
       username: SystemConfig.get("POSTGRES_USER"),
       password: SystemConfig.get("POSTGRES_PASSWORD"),
       database: SystemConfig.get("POSTGRES_DB"),
       hostname: SystemConfig.get("POSTGRES_HOST"),
       pool_size: SystemConfig.get("POSTGRES_POOL_SIZE", cast: :integer),
       pool:
         (case config_env() do
            :test -> Ecto.Adapters.SQL.Sandbox
            _ -> Ecto.Adapters.SQL.Sandbox
          end)

config :lotta, :rabbitmq,
  url:
    %URI{
      host: SystemConfig.get("RABBITMQ_HOST"),
      scheme: "amqp",
      userinfo:
        SystemConfig.get("RABBITMQ_USER", cast: :url_encode) <>
          ":" <> SystemConfig.get("RABBITMQ_PASSWORD", cast: :url_encode)
    }
    |> URI.to_string()

config :lotta, :redis_connection,
  host: SystemConfig.get("REDIS_HOST"),
  password: SystemConfig.get("REDIS_PASSWORD"),
  name: :redix

config :ex_aws, :s3,
  http_client: ExAws.Request.Hackney,
  access_key_id: SystemConfig.get("AWS_ACCESS_KEY_ID"),
  secret_access_key: SystemConfig.get("AWS_SECRET_ACCESS_KEY"),
  host: SystemConfig.get("UGC_S3_COMPAT_ENDPOINT", cast: :url_host),
  region: SystemConfig.get("UGC_S3_COMPAT_REGION"),
  scheme: SystemConfig.get("UGC_S3_COMPAT_ENDPOINT", cast: :url_scheme),
  port: SystemConfig.get("UGC_COMPAT_S3_PORT", cast: :integer)

config :lotta, Lotta.Storage.RemoteStorage,
  default_storage: SystemConfig.get("REMOTE_STORAGE_DEFAULT_STORE"),
  prefix: SystemConfig.get("REMOTE_STORAGE_PREFIX"),
  storages:
    SystemConfig.get("REMOTE_STORAGE_STORES", cast: :string_list)
    |> Enum.filter(&String.length(&1))
    |> Enum.reduce(%{}, fn storage_name, acc ->
      storage_name
      |> String.upcase()
      |> String.replace("-", "_")
      |> then(fn env_name ->
        Map.put(acc, storage_name, %{
          type: Lotta.Storage.RemoteStorage.Strategy.S3,
          config: %{
            endpoint: SystemConfig.get("REMOTE_STORAGE_#{env_name}_ENDPOINT"),
            bucket: SystemConfig.get("REMOTE_STORAGE_#{env_name}_BUCKET")
          }
        })
      end)
    end)

config :lotta, :schedule_provider_url, SystemConfig.get("SCHEDULE_PROVIDER_URL")

config :lotta, LottaWeb.Auth.AccessToken,
  secret_key: SystemConfig.get("SECRET_KEY_JWT"),
  issuer: "lotta"

config :lotta, :admin_api_key,
  username: SystemConfig.get("COCKPIT_ADMIN_API_USERNAME"),
  password: SystemConfig.get("COCKPIT_ADMIN_API_KEY")

config :lotta,
       Lotta.Mailer,
       adapter: SystemConfig.get("MAILER_ADAPTER", cast: :bamboo_adapter),
       api_key: SystemConfig.get("MAILGUN_API_KEY"),
       domain: SystemConfig.get("MAILGUN_DOMAIN"),
       default_sender: SystemConfig.get("MAILER_DEFAULT_SENDER"),
       feedback_sender: SystemConfig.get("MAILER_FEEDBACK_SENDER"),
       base_uri: SystemConfig.get("MAILGUN_BASE_URI")

config :sentry,
  dsn: SystemConfig.get("SENTRY_DSN"),
  environment_name: SystemConfig.get("APP_ENVIRONMENT", cast: :environment),
  release: SystemConfig.get("IMAGE_NAME", cast: :docker_image_tag),
  enable_source_code_context: true,
  root_source_code_paths: [File.cwd!()],
  filter: Lotta.SentryFilter

config :lotta, Lotta.Storage.ImageProcessingUrl,
  cloudimage_token: SystemConfig.get("CLOUDIMAGE_TOKEN")

if config_env() == :prod do
  config :libcluster,
    topologies: [
      k8s: [
        strategy: Cluster.Strategy.Kubernetes.DNS,
        config: [
          service: SystemConfig.get("HEADLESS_SERVICE_NAME"),
          application_name: SystemConfig.get("RELEASE_NAME"),
          polling_interval: 5000
        ]
      ]
    ]
end

config :lotta, Lotta.Notification.Provider.APNS,
  adapter:
    if(SystemConfig.get("PIGEON_USE_SANDBOX", cast: :boolean),
      do: Pigeon.Sandbox,
      else: Pigeon.APNS
    ),
  key: SystemConfig.get("APNS_KEY"),
  key_identifier: SystemConfig.get("APNS_KEY_ID"),
  team_id: SystemConfig.get("APNS_TEAM_ID"),
  topic: SystemConfig.get("APNS_TOPIC"),
  mode: if(SystemConfig.get("APNS_USE_PRODUCTION", cast: :boolean), do: :prod, else: :dev)

config :lotta, Lotta.Notification.Provider.FCM,
  adapter:
    if(SystemConfig.get("PIGEON_USE_SANDBOX", cast: :boolean),
      do: Pigeon.Sandbox,
      else: Pigeon.FCM
    ),
  project_id: SystemConfig.get("FCM_PROJECT_ID"),
  service_account_json: SystemConfig.get("FCM_SERVICE_ACCOUNT_JSON")
