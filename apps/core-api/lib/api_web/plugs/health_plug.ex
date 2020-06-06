defmodule ApiWeb.HealthPlug do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _) do
    conn
    |> send_resp(200, "OK")
  end
end
