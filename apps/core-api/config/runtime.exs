import Config

defmodule SystemConfig do
  @allowed_environments ~w(test development preview staging production)
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

      :url_with_scheme ->
        value && value |> String.replace(~r/^(?:http(s)?:\/\/)?/, "http\\1://")

      :url_encode ->
        value && URI.encode_www_form(value)

      :base64 ->
        value && Base.decode64!(value)

      :string_list ->
        value && Enum.filter(String.split(value, ","), &(String.length(&1) > 0))

      :docker_image_tag ->
        value && String.split(value, ":") |> List.last()

      :url_host ->
        value && URI.parse(value).host

      :url_scheme ->
        value && URI.parse(value).scheme
    end
  end

  defp default("APP_ENVIRONMENT", _), do: "development"
  defp default("BASE_URI_HOST", :dev), do: "local.lotta.schule,lotta.lvh.me,lotta.schule"
  defp default("BASE_URI_HOST", _), do: "lotta.schule"
  defp default("BASE_URI_PORT", :dev), do: "3000"
  defp default("BASE_URI_PORT", _), do: nil
  defp default("BASE_URI_SCHEME", env) when env in [:prod, :test], do: "https"
  defp default("BASE_URI_SCHEME", _), do: "http"
  defp default("RELEASE_NAME", _), do: "lotta"
  defp default("IMAGE_NAME", _), do: ""
  defp default("SERVICE_NAME", _), do: "core"
  defp default("HEADLESS_SERVICE_NAME", _), do: ""
  defp default("NAMESPACE", _), do: nil
  defp default("PHX_SERVER", :dev), do: "true"
  defp default("PHX_SERVER", _), do: "false"
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
  defp default("POSTGRES_POOL_SIZE", _), do: "50"

  defp default("REDIS_HOST", env) when env in [:dev, :test], do: "localhost"
  defp default("REDIS_PASSWORD", env) when env in [:dev, :test], do: "lotta"

  defp default("UGC_S3_COMPAT_ENDPOINT", env) when env in [:dev, :test],
    do: "http://localhost:9000"

  defp default("AWS_ACCESS_KEY_ID", env) when env in [:dev, :test], do: "AKIAIOSFODNN7EXAMPLE"

  defp default("AWS_SECRET_ACCESS_KEY", env) when env in [:dev, :test],
    do: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

  defp default("REMOTE_STORAGE_DEFAULT_STORE", env) when env in [:dev, :test], do: "minio"
  defp default("REMOTE_STORAGE_PREFIX", _), do: nil
  defp default("REMOTE_STORAGE_STORES", env) when env in [:dev, :test], do: "minio"
  defp default("REMOTE_STORAGE_MINIO_ENDPOINT", _), do: "http://localhost:9000/lotta-dev-ugc"
  defp default("REMOTE_STORAGE_MINIO_BUCKET", _), do: "lotta-dev-ugc"

  defp default("MAILER_ADAPTER", :test), do: "test"
  defp default("MAILER_ADAPTER", _), do: "local"
  defp default("MAILGUN_BASE_URI", _), do: "https://api.eu.mailgun.net/v3"
  defp default("MAILGUN_API_KEY", _), do: nil
  defp default("MAILGUN_DOMAIN", _), do: nil
  defp default("MAILER_DEFAULT_SENDER", env) when env in [:dev, :test], do: "mail@lotta.schule"
  defp default("MAILER_DEFAULT_SENDER", _), do: nil
  defp default("MAILER_FEEDBACK_SENDER", _), do: nil

  defp default("PIGEON_USE_SANDBOX", :test), do: "true"
  defp default("PIGEON_USE_SANDBOX", _), do: "false"
  defp default("APNS_KEY", _), do: nil
  defp default("APNS_KEY_B64", _), do: ""
  defp default("APNS_KEY_ID", _), do: nil
  defp default("APNS_TEAM_ID", _), do: nil
  defp default("APNS_TOPIC", _), do: "net.einsa.lotta"
  defp default("APNS_USE_PRODUCTION", :prod), do: "true"
  defp default("APNS_USE_PRODUCTION", _), do: false
  defp default("FCM_PROJECT_ID", _), do: nil
  defp default("FCM_SERVICE_ACCOUNT_JSON", _), do: nil
  defp default("FCM_SERVICE_ACCOUNT_JSON_B64", _), do: ""

  defp default("COCKPIT_ADMIN_API_USERNAME", _), do: "admin"
  defp default("COCKPIT_ADMIN_API_KEY", env) when env in [:dev, :test], do: "test123"
  defp default("COCKPIT_ENDPOINT", _), do: "http://localhost:4040"

  defp default("SLACK_WEBHOOK_URL", _), do: nil

  defp default("SENTRY_DSN", _), do: nil

  defp default("SCHEDULE_PROVIDER_URL", env) when env in [:dev, :test],
    do: "http://localhost:3111"

  defp default("ANALYTICS_ENDPOINT", _),
    do: "https://plausible.io"

  defp default("ANALYTICS_API_KEY", :test), do: "test"

  defp default("ANALYTICS_API_KEY", _), do: nil

  defp default("OBAN_EXCLUDE_QUEUES", _), do: ""

  defp default("EDUPLACES_AUTH_URL", _), do: "https://auth.sandbox.eduplaces.dev/oauth2"
  defp default("EDUPLACES_API_URL", _), do: "https://api.sandbox.eduplaces.dev"

  defp default("EDUPLACES_REDIRECT_URI", _),
    do: "http://localhost:4000/auth/oauth/eduplaces/callback"

  defp default("EDUPLACES_CLIENT_ID", _), do: ""
  defp default("EDUPLACES_CLIENT_SECRET", _), do: ""

  defp default(key, env),
    do:
      raise("""
        environment variable #{key} not set and no default for #{inspect(env)}.
        See here for a list of available environment variables:
        #{inspect(System.get_env())}
      """)
end

config :lotta, :environment, SystemConfig.get("APP_ENVIRONMENT", cast: :environment)

[host | alias] = SystemConfig.get("BASE_URI_HOST", cast: :string_list)

config :lotta, :base_uri,
  host: host,
  alias: alias,
  scheme: SystemConfig.get("BASE_URI_SCHEME"),
  port: SystemConfig.get("BASE_URI_PORT", cast: :integer)

# The secret key base is used to sign/encrypt cookies and other secrets.
config :lotta, LottaWeb.Endpoint,
  secret_key_base: SystemConfig.get("SECRET_KEY_BASE"),
  server: SystemConfig.get("PHX_SERVER", cast: :boolean)

config :opentelemetry, :resource,
  service: %{
    name: SystemConfig.get("SERVICE_NAME"),
    namespace: System.get_env("NAMESPACE")
  },
  deployment: %{
    environment: SystemConfig.get("APP_ENVIRONMENT"),
    version: SystemConfig.get("IMAGE_NAME")
  }

config :opentelemetry,
  span_processor: {Sentry.OpenTelemetry.SpanProcessor, []},
  sampler: {Sentry.OpenTelemetry.Sampler, []}

config :lotta,
       Lotta.Repo,
       username: SystemConfig.get("POSTGRES_USER"),
       password: SystemConfig.get("POSTGRES_PASSWORD"),
       database: SystemConfig.get("POSTGRES_DB"),
       hostname: SystemConfig.get("POSTGRES_HOST"),
       pool_size: SystemConfig.get("POSTGRES_POOL_SIZE", cast: :integer)

config :lotta, :redis_connection,
  host: SystemConfig.get("REDIS_HOST"),
  password: SystemConfig.get("REDIS_PASSWORD"),
  name: :redix

config :ex_aws, :s3,
  http_client: ExAws.Request.Finch,
  access_key_id: SystemConfig.get("AWS_ACCESS_KEY_ID"),
  secret_access_key: SystemConfig.get("AWS_SECRET_ACCESS_KEY")

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
          config:
            %{
              endpoint: SystemConfig.get("REMOTE_STORAGE_#{env_name}_ENDPOINT"),
              api_endpoint:
                System.get_env(
                  "REMOTE_STORAGE_#{env_name}_API_ENDPOINT",
                  SystemConfig.get("UGC_S3_COMPAT_ENDPOINT")
                ),
              bucket: SystemConfig.get("REMOTE_STORAGE_#{env_name}_BUCKET"),
              region: System.get_env("REMOTE_STORAGE_#{env_name}_REGION"),
              access_key_id: System.get_env("REMOTE_STORAGE_#{env_name}_ACCESS_KEY_ID"),
              secret_access_key: System.get_env("REMOTE_STORAGE_#{env_name}_SECRET_ACCESS_KEY")
            }
            |> Map.reject(fn {_k, v} -> v in [nil, ""] end)
        })
      end)
    end)

config :lotta,
       :schedule_provider_url,
       SystemConfig.get("SCHEDULE_PROVIDER_URL", cast: :url_with_scheme)

config :lotta, :analytics,
  endpoint: SystemConfig.get("ANALYTICS_ENDPOINT"),
  api_key: SystemConfig.get("ANALYTICS_API_KEY")

config :lotta, LottaWeb.Auth.AccessToken,
  secret_key: SystemConfig.get("SECRET_KEY_JWT"),
  issuer: "lotta"

config :lotta, :cockpit,
  endpoint: SystemConfig.get("COCKPIT_ENDPOINT"),
  username: SystemConfig.get("COCKPIT_ADMIN_API_USERNAME"),
  password: SystemConfig.get("COCKPIT_ADMIN_API_KEY")

config :lotta, Lotta.Administration.Notification.Slack,
  webhook: SystemConfig.get("SLACK_WEBHOOK_URL")

config :lotta,
       Lotta.Mailer,
       (case SystemConfig.get("MAILER_ADAPTER") do
          "mailgun" ->
            [
              adapter: Bamboo.MailgunAdapter,
              api_key: SystemConfig.get("MAILGUN_API_KEY"),
              domain: SystemConfig.get("MAILGUN_DOMAIN"),
              default_sender: SystemConfig.get("MAILER_DEFAULT_SENDER"),
              feedback_sender: SystemConfig.get("MAILER_FEEDBACK_SENDER"),
              base_uri: SystemConfig.get("MAILGUN_BASE_URI")
            ]

          "test" ->
            [
              adapter: Bamboo.TestAdapter,
              default_sender: SystemConfig.get("MAILER_DEFAULT_SENDER"),
              feedback_sender: SystemConfig.get("MAILER_FEEDBACK_SENDER")
            ]

          "local" ->
            [
              adapter: Bamboo.LocalAdapter,
              default_sender: SystemConfig.get("MAILER_DEFAULT_SENDER"),
              feedback_sender: SystemConfig.get("MAILER_FEEDBACK_SENDER")
            ]
        end)

config :sentry,
  dsn: SystemConfig.get("SENTRY_DSN"),
  environment_name: SystemConfig.get("APP_ENVIRONMENT", cast: :environment),
  release: SystemConfig.get("IMAGE_NAME", cast: :docker_image_tag),
  enable_source_code_context: true,
  root_source_code_paths: [File.cwd!()],
  filter: Lotta.SentryFilter,
  traces_sample_rate: 0.15,
  integrations: [
    oban: [
      capture_errors: true,
      cron: [enabled: true]
    ]
  ]

libcluster_topologies =
  case to_string(SystemConfig.get("HEADLESS_SERVICE_NAME")) do
    "" ->
      []

    service_name ->
      [
        k8s: [
          strategy: Cluster.Strategy.Kubernetes.DNS,
          config: [
            service: service_name,
            application_name: SystemConfig.get("RELEASE_NAME"),
            polling_interval: 5000
          ]
        ]
      ]
  end

config :libcluster, topologies: libcluster_topologies

config :lotta, Lotta.PushNotification,
  fcm: [
    project_id: SystemConfig.get("FCM_PROJECT_ID"),
    service_account_json:
      SystemConfig.get("FCM_SERVICE_ACCOUNT_JSON") ||
        SystemConfig.get("FCM_SERVICE_ACCOUNT_JSON_B64", cast: :base64)
  ],
  apns: [
    key: SystemConfig.get("APNS_KEY") || SystemConfig.get("APNS_KEY_B64", cast: :base64),
    key_identifier: SystemConfig.get("APNS_KEY_ID"),
    team_id: SystemConfig.get("APNS_TEAM_ID"),
    topic: SystemConfig.get("APNS_TOPIC"),
    prod?: SystemConfig.get("APNS_USE_PRODUCTION", cast: :boolean)
  ],
  sandbox?: SystemConfig.get("PIGEON_USE_SANDBOX", cast: :boolean)

config :lotta, Oban,
  engine: Oban.Engines.Basic,
  notifier: Oban.Notifiers.PG,
  repo: Lotta.Repo,
  prefix: "oban",
  plugins: [
    {Oban.Plugins.Lifeline, []},
    {Oban.Plugins.Pruner, interval: :timer.minutes(5), max_age: :timer.hours(12)},
    {Oban.Plugins.Reindexer, schedule: "@weekly"}
  ],
  queues:
    [
      file_conversion: [limit: 4],
      media_conversion: [limit: 1],
      preview_generation: [limit: 2],
      file_metadata: [limit: 2],
      tenant: [limit: 1]
    ]
    |> Enum.filter(fn {k, _} ->
      to_string(k) not in SystemConfig.get("OBAN_EXCLUDE_QUEUES", cast: :string_list)
    end)

config :lotta, Eduplaces,
  auth_url: SystemConfig.get("EDUPLACES_AUTH_URL", cast: :url_with_scheme),
  authorize_url: SystemConfig.get("EDUPLACES_AUTH_URL", cast: :url_with_scheme) <> "/auth",
  token_url: SystemConfig.get("EDUPLACES_AUTH_URL", cast: :url_with_scheme) <> "/token",
  api_url: SystemConfig.get("EDUPLACES_API_URL", cast: :url_with_scheme),
  redirect_uri: SystemConfig.get("EDUPLACES_REDIRECT_URI", cast: :url_with_scheme),
  client_id: SystemConfig.get("EDUPLACES_CLIENT_ID"),
  client_secret: SystemConfig.get("EDUPLACES_CLIENT_SECRET")
