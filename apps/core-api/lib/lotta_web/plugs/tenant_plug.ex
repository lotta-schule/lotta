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

  alias Lotta.{Repo, Tenants}

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
      Sentry.Context.set_tags_context(%{
        "tenant.id" => tenant.id,
        "tenant.slug" => tenant.slug,
        "tenant.prefix" => tenant.prefix
      })

      OpenTelemetry.Tracer.set_attributes(%{
        "tenant.id": tenant.id,
        "tenant.slug": tenant.slug,
        "tenant.prefix": tenant.prefix
      })

      Repo.put_prefix(tenant.prefix)

      conn
      |> put_private(:lotta_tenant, tenant)
    else
      conn
    end
  end

  defp tenant_by_tenant_header(conn) do
    case get_req_header(conn, "tenant") do
      ["slug:" <> slug] ->
        Tenants.get_tenant_by_slug(slug)

      ["id:" <> id] ->
        case Integer.parse(id) do
          {tenant_id, ""} ->
            Tenants.get_tenant(tenant_id)

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
    base_uri = Application.fetch_env!(:lotta, :base_uri)

    Enum.reduce(
      [
        Keyword.get(base_uri, :host)
        | Keyword.get(base_uri, :alias, [])
      ],
      nil,
      fn
        base_host, nil ->
          case Regex.run(
                 Regex.compile!("(.*)\.#{Regex.escape(base_host)}"),
                 String.replace(host_to_check, ~r/:[0-9]{4,5}$/, "")
               ) do
            [_, slug] ->
              Tenants.get_tenant_by_slug(slug)

            nil ->
              nil
          end

        _, tenant ->
          tenant
      end
    )
    # Not a slug.<base-url> domain, so check if there is a CustomDomain
    |> then(&(&1 || Tenants.get_by_custom_domain(host_to_check)))
  end
end
