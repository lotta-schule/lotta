defmodule ApiWeb.Context do
  @behaviour Plug

  import Plug.Conn

  alias Api.{Guardian, Accounts}

  def init(opts), do: opts

  def call(conn, _) do
    context = build_context(conn)
    Absinthe.Plug.put_options(conn, context: context)
  end

  defp build_context(conn) do
    %{context: Map.merge(
      get_user_context(conn),
      get_tenant_context(conn)
    )}
  end

  defp get_user_context(conn) do
    case Guardian.Plug.current_resource(conn) do
      nil -> %{}
      user -> %{current_user: user}
    end
  end

  defp get_tenant_context(conn) do
    tenant_header = get_req_header(conn, "tenant")
    with ["id:" <> id] <- tenant_header,
        ["slug:" <> slug] <- tenant_header do
      %{tenant_id: id, tenant_slug: slug}
    else
      _ -> %{}
    end
  end
end