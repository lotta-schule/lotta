defmodule LottaWeb.TenantPlugTest do
  @moduledoc false

  use Lotta.DataCase

  import Plug.Conn

  alias LottaWeb.TenantPlug
  alias Lotta.Tenants

  # Setup a test connection with a minimal Plug stack
  setup do
    {:ok, conn: %Plug.Conn{}, tenant: Tenants.get_tenant_by_slug("test")}
  end

  describe "TenantPlug" do
    test "setting tenant via 'tenant' header", %{conn: conn, tenant: tenant} do
      conn = put_req_header(conn, "tenant", "slug:test")
      conn = TenantPlug.call(conn, %{})

      assert conn.private[:lotta_tenant].id == tenant.id
    end

    test "setting tenant via x-forwarded-host header, ignoring port", %{
      conn: conn,
      tenant: tenant
    } do
      # Mock the behavior of the host header
      conn = put_req_header(conn, "x-forwarded-host", "test.lotta.schule:3123")
      Application.put_env(:lotta, :base_uri, host: "lotta.schule")

      conn = TenantPlug.call(conn, %{})

      assert conn.private[:lotta_tenant].id == tenant.id
    end

    test "no tenant found", %{conn: conn} do
      conn = TenantPlug.call(conn, %{})

      assert conn.private[:lotta_tenant] == nil
    end
  end
end
