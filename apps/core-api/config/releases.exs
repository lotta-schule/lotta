import Config

# general app config
# Token secrets
secret_key_base = System.fetch_env!("SECRET_KEY_BASE")
secret_key_jwt = System.fetch_env!("SECRET_KEY_JWT")
# Live View
secret_signing_salt_live_view = System.fetch_env!("LIVE_VIEW_SALT_SECRET")
live_view_username = System.fetch_env!("LIVE_VIEW_USERNAME")
live_view_password = System.fetch_env!("LIVE_VIEW_PASSWORD")

hostname = System.get_env("HOSTNAME") || "api.lotta.schule"
port = String.to_integer(System.get_env("PORT") || "4000")
# database
db_user = System.fetch_env!("POSTGRES_USER")
db_password = System.fetch_env!("POSTGRES_PASSWORD")
db_host = System.fetch_env!("POSTGRES_HOST")
db_name = System.fetch_env!("POSTGRES_DB")
# redis
redis_host = System.fetch_env!("REDIS_HOST")
redis_password = System.fetch_env!("REDIS_PASSWORD")
# rabbitMQ
rabbitmq_url = System.fetch_env!("RABBITMQ_URL")
# elasticsearch
elasticsearch_host = System.fetch_env!("ELASTICSEARCH_HOST")
# S3-compatible block storage for User Generated Content
ugc_s3_compat_endpoint = System.fetch_env!("UGC_S3_COMPAT_ENDPOINT")
ugc_s3_compat_access_key_id = System.fetch_env!("UGC_S3_COMPAT_ACCESS_KEY_ID")
ugc_s3_compat_secret_access_key = System.fetch_env!("UGC_S3_COMPAT_SECRET_ACCESS_KEY")
ugc_s3_compat_bucket = System.fetch_env!("UGC_S3_COMPAT_BUCKET")
ugc_s3_compat_region = System.fetch_env!("UGC_S3_COMPAT_REGION")
ugc_s3_compat_cdn_base_url = System.fetch_env!("UGC_S3_COMPAT_CDN_BASE_URL")
# App base URL
base_url = System.get_env("BASE_URL") || ".lotta.schule"
# Schedule Provider
schedule_provider_url = System.fetch_env!("SCHEDULE_PROVIDER_URL")
# Sentry Error Logging
sentry_dsn = System.fetch_env("SENTRY_DSN")
sentry_environment = System.get_env("SENTRY_ENVIRONMENT") || "prod"

host =
  case System.get_env("APP_ENVIRONMENT") do
    "staging" -> "api.staging.lotta.schule"
    _ -> "api.lotta.schule"
  end

config :api, Api.Repo,
  username: db_user,
  password: db_password,
  database: db_name,
  hostname: db_host,
  show_sensitive_data_on_connection_error: false,
  pool_size: 25

config :api, :rabbitmq_url, rabbitmq_url

config :api, :redis_connection,
  host: redis_host,
  password: redis_password,
  name: :redix

config :api, :base_url, base_url
config :api, :schedule_provider_url, schedule_provider_url

config :api, :live_view,
  username: live_view_username,
  password: live_view_password

config :api, Api.Elasticsearch.Cluster, url: elasticsearch_host

config :api, ApiWeb.Endpoint,
  url: [host: host],
  http: [:inet6, port: String.to_integer(System.get_env("PORT") || "4000")],
  secret_key_base: secret_key_base,
  live_view: [signing_salt: secret_signing_salt_live_view]

# ## Using releases (Elixir v1.9+)
#
# If you are doing OTP releases, you need to instruct Phoenix
# to start each relevant endpoint:
#
config :api, ApiWeb.Endpoint, server: true

#
# Then you can assemble a release by calling `mix release`.
# See `mix help release` for more information.

config :api, ApiWeb.Auth.AccessToken, secret_key: secret_key_jwt

config :ex_aws, :s3,
  http_client: ExAws.Request.Hackney,
  access_key_id: ugc_s3_compat_access_key_id,
  secret_access_key: ugc_s3_compat_secret_access_key,
  host: %{ugc_s3_compat_region => ugc_s3_compat_endpoint},
  region: ugc_s3_compat_region,
  scheme: "https://"

config :sentry,
  dsn: System.get_env("SENTRY_DSN"),
  environment_name: String.to_atom(System.get_env("APP_ENVIRONMENT") || "staging"),
  included_environments: ~w(production staging),
  enable_source_code_context: true,
  root_source_code_path: File.cwd!(),
  release:
  case System.get_env("APP_ENVIRONMENT") do
    "production" ->
      to_string(Application.spec(:my_app, :vsn),
    _ ->
      System.get_env("APP_RELEASE")
    )

config :lager,
  error_logger_redirect: false,
  handlers: [level: :critical]
