defmodule ApiWeb.HealthPlug do
  @moduledoc """
  Plug for a functionality which just returns an 200 OK response for HTTP requests when service is up.
  """

  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _) do
    conn
    |> send_resp(200, "OK")
  end
end
