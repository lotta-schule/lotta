defmodule LottaWeb.TenantPlug do
  @moduledoc """
  This plug reads the current tenant and sets it on the context.
  It can either be set via the host or explicitly by setting the
  "tenant" header to "slug:<slug>".

  When reading the tenant from the host, either the tenant is found
  by domain (matching a custom domain setup for the tenant), or by
  slug, matching <slug>.<base-domain> (eg <slug>.lotta.schule).
  """
  require OpenTelemetry.Tracer
  import Plug.Conn

  alias Lotta.Repo
  alias Lotta.Tenants.TenantCache

  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    otel_ctx = OpenTelemetry.Tracer.start_span("TenantPlug")

    conn
    |> put_tenant()
    |> tap(fn _ ->
      OpenTelemetry.Tracer.end_span(otel_ctx)
    end)
  end

  defp put_tenant(conn) do
    tenant = tenant_by_tenant_header(conn) || tenant_by_host_header(conn)

    if tenant do
      Lotta.Observability.put_context(tenant: tenant)

      Repo.put_prefix(tenant.prefix)

      conn
      |> put_private(:lotta_tenant, tenant)
      |> put_resp_header("x-lotta-tenant", "id:#{tenant.id}")
    else
      conn
    end
  end

  defp tenant_by_tenant_header(conn),
    do:
      fetch_tenant_from_header(conn, "tenant") ||
        fetch_tenant_from_header(conn, "x-lotta-tenant")

  defp fetch_tenant_from_header(conn, header_name) do
    case get_req_header(conn, header_name) do
      ["slug:" <> slug] ->
        TenantCache.get_tenant_by_slug(slug)

      ["id:" <> id] ->
        case Integer.parse(id) do
          {tenant_id, ""} ->
            TenantCache.get_tenant(tenant_id)

          _ ->
            nil
        end

      _ ->
        nil
    end
  end

  defp tenant_by_host_header(conn) do
    host =
      Enum.find_value(
        ["x-lotta-originary-host", "x-forwarded-host", "host"],
        &List.first(get_req_header(conn, &1))
      )

    tenant_by_host(host)
  end

  defp tenant_by_host(nil), do: nil

  defp tenant_by_host(host_to_check) do
    host_without_port = String.replace(host_to_check, ~r/:[0-9]{4,5}$/, "")

    Enum.find_value(base_host_regexes(), fn regex ->
      case Regex.run(regex, host_without_port) do
        [_, slug] -> TenantCache.get_tenant_by_slug(slug)
        nil -> nil
      end
    end)
    # Not a slug.<base-url> domain, so check if there is a CustomDomain
    |> then(&(&1 || TenantCache.get_by_custom_domain(host_to_check)))
  end

  # The base hosts come from the (runtime) config, so the regexes are compiled
  # once and kept in :persistent_term instead of on every request.
  defp base_host_regexes() do
    base_uri = Application.fetch_env!(:lotta, :base_uri)
    base_hosts = [Keyword.get(base_uri, :host) | Keyword.get(base_uri, :alias, [])]

    case :persistent_term.get({__MODULE__, :base_host_regexes}, nil) do
      {^base_hosts, regexes} ->
        regexes

      _ ->
        regexes = Enum.map(base_hosts, &Regex.compile!("(.*)\\.#{Regex.escape(&1)}"))
        :persistent_term.put({__MODULE__, :base_host_regexes}, {base_hosts, regexes})
        regexes
    end
  end
end
