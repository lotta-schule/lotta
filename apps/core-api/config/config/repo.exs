import Config

config :lotta, ecto_repos: [Lotta.Repo]

if config_env() == :test do
  config :lotta, Lotta.Repo, pool: Ecto.Adapters.SQL.Sandbox
end
