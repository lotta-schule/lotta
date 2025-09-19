defmodule LottaWeb.TenantControllerTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Phoenix.ConnTest
  import Tesla.Mock

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

    {:ok, _} =
      Accounts.register_user_by_mail(new_tenant, %{
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

      Enum.zip(tenants, body["tenants"])
      |> Enum.each(fn {tenant, tenant_json} ->
        assert tenant_json["id"] == tenant.id
        assert tenant_json["title"] == tenant.title
        assert tenant_json["slug"] == tenant.slug
        assert tenant_json["logoImageFileId"] == nil
        assert tenant_json["backgroundImageFileId"] == nil
      end)
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

  describe "Create test tenant" do
    test "creates a test tenant with valid parameters" do
      tenant_params = %{
        "title" => "Test School",
        "slug" => "test-school"
      }

      user_params = %{
        "name" => "Test Admin",
        "email" => "admin@test-school.example"
      }

      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", "Basic " <> Base.encode64("admin:test123"))
        |> post("/admin-api/create-test", %{
          "tenant" => tenant_params,
          "user" => user_params
        })

      body = json_response(conn, 200)
      assert body["success"] == true
      assert body["tenant"]["title"] == "Test School"
      assert body["tenant"]["slug"] == "test-school"
      assert is_integer(body["tenant"]["id"])
    end

    test "returns error when tenant parameters are invalid" do
      tenant_params = %{
        "title" => "",
        "slug" => ""
      }

      user_params = %{
        "name" => "Test Admin",
        "email" => "admin@test-school.example"
      }

      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", "Basic " <> Base.encode64("admin:test123"))
        |> post("/admin-api/create-test", %{
          "tenant" => tenant_params,
          "user" => user_params
        })

      assert json_response(conn, 422)
    end

    test "returns error when user parameters are invalid" do
      tenant_params = %{
        "title" => "Test School",
        "slug" => "test-school-2"
      }

      user_params = %{
        "name" => "",
        "email" => "invalid-email"
      }

      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", "Basic " <> Base.encode64("admin:test123"))
        |> post("/admin-api/create-test", %{
          "tenant" => tenant_params,
          "user" => user_params
        })

      assert json_response(conn, 422)
    end

    test "returns unauthorized when no authentication provided" do
      tenant_params = %{
        "title" => "Test School",
        "slug" => "test-school"
      }

      user_params = %{
        "name" => "Test Admin",
        "email" => "admin@test-school.example"
      }

      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> post("/admin-api/create-test", %{
          "tenant" => tenant_params,
          "user" => user_params
        })

      assert conn.status == 401
    end
  end

  describe "Delete tenant" do
    test "deletes an existing tenant", %{tenants: tenants} do
      tenant = List.first(tenants)

      mock(fn
        %{method: :delete, url: url} when is_binary(url) ->
          %Tesla.Env{status: 200, body: %{}}
      end)

      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", "Basic " <> Base.encode64("admin:test123"))
        |> post("/admin-api/delete-tenant", %{
          "tenant" => %{"id" => tenant.id}
        })

      body = json_response(conn, 200)
      assert body["success"] == true

      assert Tenants.get_tenant(tenant.id) == nil
    end

    test "returns error when tenant does not exist" do
      mock(fn
        %{method: :delete, url: url} when is_binary(url) ->
          %Tesla.Env{status: 200, body: %{}}
      end)

      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", "Basic " <> Base.encode64("admin:test123"))
        |> post("/admin-api/delete-tenant", %{
          "tenant" => %{"id" => 999_999}
        })

      assert json_response(conn, 404)
    end

    test "returns error when tenant id is not provided" do
      mock(fn
        %{method: :delete, url: url} when is_binary(url) ->
          %Tesla.Env{status: 200, body: %{}}
      end)

      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", "Basic " <> Base.encode64("admin:test123"))
        |> post("/admin-api/delete-tenant", %{
          "tenant" => %{}
        })

      assert json_response(conn, 400)
    end

    test "returns unauthorized when no authentication provided" do
      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> post("/admin-api/delete-tenant", %{
          "tenant" => %{"id" => 1}
        })

      assert conn.status == 401
    end
  end
end
