defmodule LottaWeb.SetupControllerTest do
  use LottaWeb.ConnCase

  alias Lotta.Repo
  alias Lotta.Tenants.Tenant

  describe "GET /setup/status" do
    test "renders status page for tenant in init state", %{conn: conn} do
      tenant =
        %Tenant{
          title: "Test School",
          slug: "test-init",
          state: :init
        }
        |> Repo.insert!()

      conn =
        conn
        |> put_req_header("tenant", "slug:#{tenant.slug}")
        |> get("/setup/status")

      assert html_response(conn, 200) =~ "Lotta wird für deine Schule eingerichtet"
    end

    test "redirects to tenant URL for active tenant", %{conn: conn} do
      tenant =
        %Tenant{
          title: "Test School",
          slug: "test-active",
          state: :active
        }
        |> Repo.insert!()

      conn =
        conn
        |> put_req_header("tenant", "slug:#{tenant.slug}")
        |> get("/setup/status")

      assert redirected_to(conn) =~ "https://test-active.lotta.schule"
    end

    test "redirects to tenant URL for readonly tenant", %{conn: conn} do
      tenant =
        %Tenant{
          title: "Test School",
          slug: "test-readonly",
          state: :readonly
        }
        |> Repo.insert!()

      conn =
        conn
        |> put_req_header("tenant", "slug:#{tenant.slug}")
        |> get("/setup/status")

      assert redirected_to(conn) =~ "https://test-readonly.lotta.schule"
    end

    test "returns 404 for non-existent tenant", %{conn: conn} do
      conn = get(conn, "/setup/status")

      assert html_response(conn, 404) =~ "Instanz nicht gefunden"
    end
  end
end
