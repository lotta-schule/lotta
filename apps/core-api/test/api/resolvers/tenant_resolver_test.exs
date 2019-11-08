defmodule Api.TenantResolverTest do
  use ApiWeb.ConnCase, async: true
  
  setup do
    Api.Repo.Seeder.seed()

    web_tenant = Api.Tenants.get_tenant_by_slug!("web")
    admin = Api.Repo.get_by!(Api.Accounts.User, [email: "alexis.rinaldoni@einsa.net"])
    {:ok, jwt, _} = Api.Guardian.encode_and_sign(admin, %{ email: admin.email, name: admin.name })

    {:ok, %{
      web_tenant: web_tenant,
      admin_account: admin,
      jwt: jwt
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
  test "update tenant mutation should upate title", %{web_tenant: web_tenant, jwt: jwt} do
    tenant = %{
      title: "Web Beispiel Neu"
    }
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{jwt}")
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

end