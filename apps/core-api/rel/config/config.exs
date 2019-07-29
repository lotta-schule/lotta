use Mix.Config

port = String.to_integer(System.get_env("PORT") || "4000")

config :api_web, ApiWeb.Endpoint,
  http: [port: port],
  url: [host: System.get_env("HOSTNAME"), port: port],
  secret_key_base: System.get_env("SECRET_KEY_BASE")

config :api, Api.Guardian,
  issuer: "lotta",
  secret_key: System.get_env("SECRET_KEY_JWT")

config :ex_aws, :s3,
  http_client: ExAws.Request.Hackney,
  access_key_id: System.get_env("UGC_S3_COMPAT_ACCESS_KEY_ID"),
  secret_access_key: System.get_env("UGC_S3_COMPAT_SECRET_ACCESS_KEY"),
  host: %{System.get_env("UGC_S3_COMPAT_REGION") => System.get_env("UGC_S3_COMPAT_ENDPOINT")},
  region: System.get_env("UGC_S3_COMPAT_REGION"),
  scheme: "https://"

config :sentry,
  dsn: System.get_env("SENTRY_DSN"),
  enable_source_code_context: true,
  root_source_code_path: File.cwd!(),
  environment_name: Mix.env(),
  included_environments: ~w(production staging),
  environment_name: System.get_env("RELEASE_LEVEL") || "development"

config :lager,
  error_logger_redirect: false,
  handlers: [level: :critical]
