defmodule LottaWeb.TenantPlug do
  @moduledoc """
  This plug reads the current tenant and sets it on the context.
  It can either be set via the host or explicitly by setting the
  "tenant" header to "slug:<slug>".

  When reading the tenant from the host, either the tenant is found
  by domain (matching a custom domain setup for the tenant), or by
  slug, matching <slug>.<base-domain> (eg <slug>.lotta.schule).
  """
  import Plug.Conn

  alias Lotta.{Repo, Tenants}

  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    conn
    |> put_tenant()
  end

  defp put_tenant(conn) do
    tenant = tenant_by_slug_header(conn) || tenant_by_host_header(conn)

    if tenant do
      Repo.put_prefix(tenant.prefix)
      put_private(conn, :lotta_tenant, tenant)
    else
      conn
    end
  end

  defp tenant_by_slug_header(conn) do
    case get_req_header(conn, "tenant") do
      ["slug:" <> slug] ->
        Tenants.get_tenant_by_slug(slug)

      _ ->
        nil
    end
  end

  defp tenant_by_host_header(conn) do
    host =
      Enum.find_value(
        ["x-forwarded-host", "host"],
        &List.first(get_req_header(conn, &1))
      )

    tenant_by_host(host)
  end

  defp tenant_by_host(nil), do: nil

  defp tenant_by_host(host) do
    base_url =
      Keyword.get(
        Application.get_env(:lotta, :base_uri),
        :host
      )

    case Regex.run(Regex.compile!("(.*)\.#{Regex.escape(base_url)}"), host) do
      [_string, slug] ->
        Tenants.get_tenant_by_slug(slug)

      _e ->
        # Not a slug.<base-url> domain, so check if there is a CustomDomain
        Tenants.get_by_custom_domain(host)
    end
  end
end
