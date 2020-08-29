defmodule Api.Repo do
  use Ecto.Repo,
    otp_app: :api,
    adapter: Ecto.Adapters.Postgres

  def after_connect(pid, schema) do
    Postgrex.query!(pid, "SET search_path TO #{schema}", [])
  end
end
