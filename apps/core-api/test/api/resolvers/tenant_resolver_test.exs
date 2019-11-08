defmodule Api.TenantResolverTest do
  use ApiWeb.ConnCase, async: true
  
  setup do
    Api.Repo.Seeder.seed()

    web_tenant = Api.Tenants.get_tenant_by_slug!("web")
    admin = Api.Repo.get_by!(Api.Accounts.User, [email: "alexis.rinaldoni@einsa.net"])
    user = Api.Repo.get_by!(Api.Accounts.User, [email: "eike.wiewiorra@einsa.net"])
    {:ok, admin_jwt, _} = Api.Guardian.encode_and_sign(admin, %{ email: admin.email, name: admin.name })
    {:ok, user_jwt, _} = Api.Guardian.encode_and_sign(user, %{ email: user.email, name: user.name })

    {:ok, %{
      web_tenant: web_tenant,
      admin_account: admin,
      admin_jwt: admin_jwt,
      user_account: user,
      user_jwt: user_jwt,
    }}
  end

  @query """
  {
    tenant {
      id
      slug
      title
    }
  }
  """
  test "tenant field returns nil if slug tenant header is not set" do
    res = build_conn()
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "tenant" => nil
      }
    }
  end


  @query """
  {
    tenant {
      id
      slug
      title
    }
  }
  """
  test "tenant field returns current tenant if slug is set in tenant header", %{web_tenant: web_tenant} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "tenant" => %{
          "id" => web_tenant.id,
          "slug" => "web",
          "title" => "Web Beispiel"
        }
      }
    }
  end


  @query """
  {
    tenants {
      id
      slug
      title
    }
  }
  """
  test "tenants field returns all registered tenants", %{web_tenant: web_tenant} do
    res = build_conn()
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "tenants" => [%{
          "id" => web_tenant.id,
          "slug" => "web",
          "title" => "Web Beispiel"
        }]
      }
    }
  end


  @query """
  mutation ($tenant: TenantInput!) {
    updateTenant(tenant: $tenant) {
      id
      slug
      title
    }
  }
  """
  test "update tenant mutation should upate title", %{web_tenant: web_tenant, admin_jwt: admin_jwt} do
    tenant = %{
      title: "Web Beispiel Neu"
    }
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{admin_jwt}")
    |> post("/api", query: @query, variables: %{tenant: tenant})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "updateTenant" => %{
          "id" => web_tenant.id,
          "slug" => "web",
          "title" => "Web Beispiel Neu"
        }
      }
    }
  end


  @query """
  mutation ($tenant: TenantInput!) {
    updateTenant(tenant: $tenant) {
      id
      slug
      title
    }
  }
  """
  test "update tenant mutation should return error if user is not admin", %{web_tenant: web_tenant, user_jwt: user_jwt} do
    tenant = %{
      title: "Web Beispiel Neu"
    }
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{user_jwt}")
    |> post("/api", query: @query, variables: %{tenant: tenant})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "updateTenant" => nil
      },
      "errors" => [
        %{
          "locations" => [%{"column" => 0, "line" => 2}],
          "message" => "Nur Administratoren dürfen das.",
          "path" => ["updateTenant"]
        }
      ]
    }
  end


  @query """
  mutation ($tenant: TenantInput!) {
    updateTenant(tenant: $tenant) {
      id
      slug
      title
    }
  }
  """
  test "update tenant mutation should return error if user is not logged in", %{web_tenant: web_tenant} do
    tenant = %{
      title: "Web Beispiel Neu"
    }
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> post("/api", query: @query, variables: %{tenant: tenant})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "updateTenant" => nil
      },
      "errors" => [
        %{
          "locations" => [%{"column" => 0, "line" => 2}],
          "message" => "Nur Administratoren dürfen das.",
          "path" => ["updateTenant"]
        }
      ]
    }
  end

end