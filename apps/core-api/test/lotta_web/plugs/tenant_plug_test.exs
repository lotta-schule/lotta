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
    test "setting tenant via 'tenant' header with a slug value", %{conn: conn, tenant: tenant} do
      id = tenant.id

      conn =
        conn
        |> put_req_header("tenant", "slug:test")
        |> TenantPlug.call(%{})

      assert %{private: %{lotta_tenant: %{id: ^id}}} = conn
    end

    test "setting tenant via 'tenant' header with an id value", %{conn: conn, tenant: tenant} do
      id = tenant.id

      conn =
        conn
        |> put_req_header("tenant", "id:#{id}")
        |> TenantPlug.call(%{})

      assert %{private: %{lotta_tenant: %{id: ^id}}} = conn
    end

    test "setting tenant via x-forwarded-host header, ignoring port", %{
      conn: conn,
      tenant: tenant
    } do
      id = tenant.id

      conn =
        conn
        |> put_req_header("x-forwarded-host", "test.lotta.schule:3123")
        |> TenantPlug.call(%{})

      assert %{private: %{lotta_tenant: %{id: ^id}}} = conn
    end

    test "no tenant found", %{conn: conn} do
      assert %{private: %{}} = TenantPlug.call(conn, %{})
    end
  end
end
