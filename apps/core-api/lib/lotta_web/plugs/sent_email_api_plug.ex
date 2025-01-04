require Protocol

Protocol.derive(Jason.Encoder, Bamboo.Attachment, only: [:filename, :content_type, :path])

defmodule LottaWeb.SentEmailApiPlug do
  @moduledoc """
  Plug forwarding to Bamboo.SentEmailViewerPlug only if Bamboo.LocalAdapter is used.
  If the adapter is not Bamboo.LocalAdapter, the plug will return a 404.
  """
  @behaviour Plug

  def init(opts), do: opts

  def call(%Plug.Conn{} = conn, _) do
    if local_adapter?() do
      Bamboo.SentEmailApiPlug.call(conn, [])
    else
      Plug.Conn.send_resp(conn, 404, "Not found")
    end
  end

  defp local_adapter?() do
    mailer_config()[:adapter] == Bamboo.LocalAdapter
  end

  defp mailer_config() do
    Application.fetch_env!(:lotta, Lotta.Mailer)
  end
end
