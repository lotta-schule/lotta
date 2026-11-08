import Config

config :lotta, :urls_module, LottaWeb.Urls

# Request-path tenant lookups are cached for a few seconds (see the module).
config :lotta, Lotta.Tenants.TenantCache, enabled: true

if config_env() == :test do
  config :lotta, :urls_module, LottaWeb.UrlsMock

  # Tests create and roll back tenants (with reused slugs) all the time.
  config :lotta, Lotta.Tenants.TenantCache, enabled: false
end
