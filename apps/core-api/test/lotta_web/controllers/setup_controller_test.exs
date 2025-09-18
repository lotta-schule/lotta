defmodule LottaWeb.SetupControllerTest do
  use LottaWeb.ConnCase

  alias Lotta.Repo
  alias Lotta.Tenants.Tenant

  describe "GET /setup/:slug/status" do
    test "renders status page for tenant in init state", %{conn: conn} do
      %Tenant{
        title: "Test School",
        slug: "test-init",
        state: :init
      }
      |> Repo.insert!()

      conn = get(conn, "/setup/test-init/status")

      assert html_response(conn, 200) =~ "Lotta is being setup"
    end

    test "redirects to tenant URL for active tenant", %{conn: conn} do
      %Tenant{
        title: "Test School",
        slug: "test-active",
        state: :active
      }
      |> Repo.insert!()

      conn = get(conn, "/setup/test-active/status")

      assert redirected_to(conn) =~ "https://test-active.lotta.schule"
    end

    test "redirects to tenant URL for readonly tenant", %{conn: conn} do
      %Tenant{
        title: "Test School",
        slug: "test-readonly",
        state: :readonly
      }
      |> Repo.insert!()

      conn = get(conn, "/setup/test-readonly/status")

      assert redirected_to(conn) =~ "https://test-readonly.lotta.schule"
    end

    test "returns 404 for non-existent tenant", %{conn: conn} do
      conn = get(conn, "/setup/non-existent/status")

      assert html_response(conn, 404) =~ "Tenant not found"
    end
  end
end
