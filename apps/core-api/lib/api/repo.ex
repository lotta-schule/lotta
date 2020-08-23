defmodule Api.Repo do
  use Ecto.Repo,
    otp_app: :api,
    adapter: Ecto.Adapters.Postgres

  def after_connect(pid) do
    Postgrex.query!(pid, "SET search_path TO tenant_2", [])
  end
end
