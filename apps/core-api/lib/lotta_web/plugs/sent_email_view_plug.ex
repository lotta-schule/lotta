defmodule LottaWeb.SentEmailViewPlug do
  @moduledoc """
  Plug forwarding to Bamboo.SentEmailViewerPlug only if Bamboo.LocalAdapter is used.
  If the adapter is not Bamboo.LocalAdapter, the plug will return a 404.
  """
  @behaviour Plug

  import Plug

  def init(opts), do: opts

  def call(%Conn{} = conn, _) do
    if is_local_adapter?() do
      Bamboo.SentEmailViewerPlug.call(conn, [])
    else
      send_resp(conn, 404, "Not Found")
    end
  end

  defp is_local_adapter?() do
    adapter =
      Application.fetch_env!(:lotta, Lotta.Mailer)[:adapter]

    adapter == Bamboo.LocalAdapter
  end
end
