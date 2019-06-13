defmodule Api.Repo do
  use Ecto.Repo,
    otp_app: :api,
    adapter: Ecto.Adapters.Postgres

    def init(_type, config) do
      {:ok, Keyword.merge(config, [
        database: System.get_env("POSTGRES_DB"),
        username: System.get_env("POSTGRES_USER"),
        password: System.get_env("POSTGRES_PASSWORD"),
        hostname: System.get_env("POSTGRES_HOST"),
      ])}
    end
end
