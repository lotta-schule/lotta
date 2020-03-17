defmodule Api.ReadRepo do
  use Ecto.Repo,
    otp_app: :api,
    adapter: Ecto.Adapters.Postgres
end