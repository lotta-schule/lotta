import Config

config :lotta, Lotta.Repo, start_apps_before_migration: [:httpoison]
config :lotta, ecto_repos: [Lotta.Repo]
