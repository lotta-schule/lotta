defmodule LottaWeb.TenantControllerTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Phoenix.ConnTest

  alias Lotta.{Accounts, Tenants, Repo}
  alias Lotta.Tenants.Tenant

  setup do
    new_tenant =
      Repo.insert!(%Tenant{
        title: "Test Lotta 2",
        slug: "test2",
        prefix: "tenant_test2"
      })

    Lotta.Tenants.TenantDbManager.create_tenant_database_schema(new_tenant)

    email = "alexis.rinaldoni@einsa.net"

    {:ok, _, _pw} =
      Accounts.register_user(new_tenant, %{
        name: "Alexis Rinaldoni",
        email: email,
        password: "test123"
      })

    tenants = Tenants.list_tenants()

    %{email: email, tenants: tenants}
  end

  describe "List tenants for a user" do
    test "returns a list of tenants for a user registered in multiple tenants", %{
      tenants: tenants,
      email: email
    } do
      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> get("/api/public/user-tenants?username=#{email}")

      body = json_response(conn, 200)
      assert body["success"] == true

      assert body["tenants"] ==
               Enum.map(
                 tenants,
                 &%{
                   "id" => &1.id,
                   "title" => &1.title,
                   "slug" => &1.slug,
                   "logoImageFileId" => nil,
                   "backgroundImageFileId" => nil
                 }
               )
    end

    test "should return an empty list if the user is not provided" do
      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> get("/api/public/user-tenants")

      body = json_response(conn, 200)
      assert body["success"] == true
      assert body["tenants"] == []
    end

    test "should return an empty list if the user has no matches" do
      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> get("/api/public/user-tenants?username=notfound")

      body = json_response(conn, 200)
      assert body["success"] == true
      assert body["tenants"] == []
    end
  end
end
