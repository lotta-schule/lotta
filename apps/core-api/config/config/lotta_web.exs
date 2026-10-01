import Config

config :lotta, :urls_module, LottaWeb.Urls

if config_env() == :test do
  config :lotta, :urls_module, LottaWeb.UrlsMock
end
