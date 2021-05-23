import Config

# config
slug = System.fetch_env!("SHORT_TITLE")
# App base URL
hostname = System.get_env("HOSTNAME") || "#{slug}.lotta.schule"

config :api, Api.Repo,
  username: System.fetch_env!("POSTGRES_USER"),
  password: System.fetch_env!("POSTGRES_PASSWORD"),
  database: System.fetch_env!("POSTGRES_DB"),
  hostname: System.fetch_env!("POSTGRES_HOST"),
  prefix: System.fetch_env!("POSTGRES_SCHEMA"),
  after_connect: {Api.Repo, :after_connect, [System.fetch_env!("POSTGRES_SCHEMA")]},
  show_sensitive_data_on_connection_error: false,
  pool_size: 10

config :api, :default_configuration, %{
  slug: slug,
  title: System.fetch_env!("TITLE"),
  custom_theme: %{}
}

config :api, :rabbitmq,
  url: System.fetch_env!("RABBITMQ_URL"),
  prefix: System.get_env("RABBITMQ_PREFIX")

config :api, :redis_connection,
  host: System.fetch_env!("REDIS_HOST"),
  password: System.fetch_env!("REDIS_PASSWORD"),
  name: :redix

config :api, :hostname, hostname
config :api, :schedule_provider_url, System.fetch_env!("SCHEDULE_PROVIDER_URL")

config :api, :live_view,
  username: System.fetch_env!("LIVE_VIEW_USERNAME"),
  password: System.fetch_env!("LIVE_VIEW_PASSWORD")

config :api, ApiWeb.Auth.AccessToken, secret_key: System.fetch_env!("SECRET_KEY_JWT")

config :api, :default_user, %{
  name: System.get_env("DEFAULT_USER_NAME"),
  email: System.get_env("DEFAULT_USER_EMAIL"),
  hide_full_name: false,
  password: System.get_env("DEFAULT_USER_PASSWORD")
}

config :api, Api.Elasticsearch.Cluster,
  url: System.fetch_env!("ELASTICSEARCH_HOST"),
  index_prefix: System.fetch_env!("ELASTICSEARCH_INDEX_PREFIX")

config :api, ApiWeb.Endpoint,
  url: [host: hostname],
  http: [:inet6, port: String.to_integer(System.get_env("PORT") || "4000")],
  secret_key_base: System.fetch_env!("SECRET_KEY_BASE"),
  live_view: [signing_salt: System.fetch_env!("LIVE_VIEW_SALT_SECRET")]

config :api, Api.Storage.RemoteStorage,
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
        type: Api.Storage.RemoteStorage.Strategy.S3,
        config: %{
          endpoint: System.get_env("REMOTE_STORAGE_#{env_name}_ENDPOINT"),
          bucket: System.get_env("REMOTE_STORAGE_#{env_name}_BUCKET")
        }
      })
    end)

config :api, Api.Mailer,
  adapter: Bamboo.MailgunAdapter,
  api_key: System.get_env("MAILGUN_API_KEY"),
  domain: System.get_env("MAILGUN_DOMAIN"),
  default_sender: System.get_env("MAILER_DEFAULT_SENDER"),
  base_uri: "https://api.eu.mailgun.net/v3"

config :api, ApiWeb.Endpoint, server: true

config :ex_aws, :s3,
  http_client: ExAws.Request.Hackney,
  host: %{
    System.fetch_env!("UGC_S3_COMPAT_REGION") => System.fetch_env!("UGC_S3_COMPAT_ENDPOINT")
  },
  region: System.fetch_env!("UGC_S3_COMPAT_REGION"),
  scheme: "https://"

sentry_environment =
  System.get_env("SENTRY_ENVIRONMENT") || System.get_env("APP_ENVIRONMENT") || "staging"

config :sentry,
  dsn: System.get_env("SENTRY_DSN"),
  environment_name: sentry_environment,
  included_environments: ~w(production staging),
  enable_source_code_context: true,
  root_source_code_path: File.cwd!(),
  release:
    (case(sentry_environment) do
       "production" ->
         to_string(Application.spec(:my_app, :vsn))

       _ ->
         System.get_env("APP_RELEASE")
     end)

config :lager,
  error_logger_redirect: false,
  handlers: [level: :debug]
