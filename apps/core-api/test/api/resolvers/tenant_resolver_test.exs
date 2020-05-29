defmodule Api.TenantResolverTest do
  use ApiWeb.ConnCase

  setup do
    Api.Repo.Seeder.seed()

    web_tenant = Api.Tenants.get_tenant_by_slug!("web")
    lotta_admin = Api.Repo.get_by!(Api.Accounts.User, [email: "alexis.rinaldoni@einsa.net"])
    admin = Api.Repo.get_by!(Api.Accounts.User, [email: "alexis.rinaldoni@lotta.schule"])
    user = Api.Repo.get_by!(Api.Accounts.User, [email: "eike.wiewiorra@lotta.schule"])
    {:ok, lotta_admin_jwt, _} = Api.Guardian.encode_and_sign(lotta_admin, %{ email: lotta_admin.email, name: lotta_admin.name })
    {:ok, admin_jwt, _} = Api.Guardian.encode_and_sign(admin, %{ email: admin.email, name: admin.name })
    {:ok, user_jwt, _} = Api.Guardian.encode_and_sign(user, %{ email: user.email, name: user.name })

    {:ok, %{
      web_tenant: web_tenant,
      lotta_admin_account: lotta_admin,
      lotta_admin_jwt: lotta_admin_jwt,
      admin_account: admin,
      admin_jwt: admin_jwt,
      user_account: user,
      user_jwt: user_jwt,
    }}
  end


  describe "tenant query" do
    @query """
    {
      tenant {
        id
        slug
        title
      }
    }
    """

    test "returns nil if slug tenant header or origin header is not set" do
      res = build_conn()
      |> get("/api", query: @query)
      |> json_response(200)

      assert res == %{
        "data" => %{
          "tenant" => nil
        }
      }
    end

    test "returns nil if slug tenant header and origin is not a known domain" do
      res = build_conn()
      |> put_req_header("origin", "unknown.com")
      |> get("/api", query: @query)
      |> json_response(200)

      assert res == %{
        "data" => %{
          "tenant" => nil
        }
      }
    end

    test "returns current tenant if origin is a known domain", %{web_tenant: web_tenant} do
      res = build_conn()
      |> put_req_header("origin", "https://lotta.web")
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

    test "returns current tenant if slug is set in tenant header", %{web_tenant: web_tenant} do
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
  end


  describe "tenants query" do
    @query """
    {
      tenants {
        slug
        title
      }
    }
    """

    test "returns all registered tenants" do
      res = build_conn()
      |> get("/api", query: @query)
      |> json_response(200)

      assert res == %{
        "data" => %{
          "tenants" => [
            %{
              "slug" => "lotta",
              "title" => "Lotta"
            },
            %{
              "slug" => "web",
              "title" => "Web Beispiel"
            }
          ]
        }
      }
    end
  end

  describe "createTenant mutation for lotta-admin" do
    @query """
    mutation CreateTenant($title: String!, $slug: String!, $email: String!, $name: String!) {
      createTenant(title: $title, slug: $slug, email: $email, name: $name) {
        slug
        title
        categories {
          title
        }
        groups {
          name
        }
      }
    }
    """

    test "should return an error if user is not lotta-Admin", %{user_jwt: user_jwt} do
      res = build_conn()
      |> put_req_header("authorization", "Bearer #{user_jwt}")
      |> post("/api", query: @query, variables: %{title: "Neu", slug: "neu", email: "neuernutzer@lotta.schule", name: "Neuer Nutzer"})
      |> json_response(200)

      assert res == %{
          "data" => %{
            "createTenant" => nil
          },
          "errors" => [
            %{
              "locations" => [%{"column" => 0, "line" => 2}],
              "message" => "Nur Lotta-Administratoren dürfen das.",
              "path" => ["createTenant"]
            }
          ]
        }
    end

    test "should return an error if slug is taken", %{lotta_admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{title: "Neu", slug: "web", email: "neuernutzer@lotta.schule", name: "Neuer Nutzer"})
      |> json_response(200)

      assert res == %{
          "data" => %{
            "createTenant" => nil
          },
          "errors" => [
            %{
              "locations" => [%{"column" => 0, "line" => 2}],
              "message" => "Erstellen des Tenant fehlgeschlagen.",
              "path" => ["createTenant"],
              "details" => %{
                "slug" => ["ist schon belegt"]
              }
            }
          ]
        }
    end

    test "should create a tenant for a new admin", %{lotta_admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{title: "Neu", slug: "neu", email: "neuernutzer@lotta.schule", name: "Neuer Nutzer"})
      |> json_response(200)

      assert res["data"]["createTenant"]["slug"] == "neu"
      assert res["data"]["createTenant"]["title"] == "Neu"
      assert res["data"]["createTenant"]["categories"] == [%{"title" => "Startseite"}]
      res["data"]["createTenant"]["groups"]
      |> Enum.all?(fn group ->
        Enum.find(["Administrator", "Lehrer", "Schüler"], fn name ->
          group["name"] == name
        end) != nil
      end)

      tenant = Api.Tenants.get_tenant_by_slug("neu")
      user = Api.Accounts.get_user_by_email("neuernutzer@lotta.schule")

      assert tenant != nil
      assert user != nil

      assert Api.Accounts.User.is_admin?(user, tenant)
    end

  end

  describe "createTenant mutation for new customers" do
    @query """
    mutation CreateTenant($title: String!, $slug: String!) {
      createTenant(title: $title, slug: $slug) {
        slug
        title
        categories {
          title
        }
        groups {
          name
        }
      }
    }
    """

    test "should return an error if slug is taken", %{user_jwt: user_jwt} do
      res = build_conn()
      |> put_req_header("authorization", "Bearer #{user_jwt}")
      |> post("/api", query: @query, variables: %{title: "Neu", slug: "web", email: "neuernutzer@lotta.schule", name: "Neuer Nutzer"})
      |> json_response(200)

      assert res == %{
          "data" => %{
            "createTenant" => nil
          },
          "errors" => [
            %{
              "locations" => [%{"column" => 0, "line" => 2}],
              "message" => "Erstellen des Tenant fehlgeschlagen.",
              "path" => ["createTenant"],
              "details" => %{
                "slug" => ["ist schon belegt"]
              }
            }
          ]
        }
    end

    test "should return an error if slug is 'intern'", %{user_jwt: user_jwt} do
      res = build_conn()
      |> put_req_header("authorization", "Bearer #{user_jwt}")
      |> post("/api", query: @query, variables: %{title: "Neu", slug: "web"})
      |> json_response(200)

      assert res == %{
          "data" => %{
            "createTenant" => nil
          },
          "errors" => [
            %{
              "locations" => [%{"column" => 0, "line" => 2}],
              "message" => "Erstellen des Tenant fehlgeschlagen.",
              "path" => ["createTenant"],
              "details" => %{
                "slug" => ["ist schon belegt"]
              }
            }
          ]
        }
    end

    test "should return an error if user is already admin for a tenant", %{admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{title: "Test-Schule", slug: "test-schule"})
      |> json_response(200)

      assert res == %{
          "data" => %{
            "createTenant" => nil
          },
          "errors" => [
            %{
              "locations" => [%{"column" => 0, "line" => 2}],
              "message" => "Der Nutzer ist schon Administrator bei lotta.",
              "path" => ["createTenant"]
            }
          ]
        }
    end

    test "should create a tenant for user", %{user_jwt: user_jwt, user_account: user_account} do
      res = build_conn()
      |> put_req_header("authorization", "Bearer #{user_jwt}")
      |> post("/api", query: @query, variables: %{title: "Neu", slug: "neu", email: "neuernutzer@lotta.schule", name: "Neuer Nutzer"})
      |> json_response(200)

      assert res["data"]["createTenant"]["slug"] == "neu"
      assert res["data"]["createTenant"]["title"] == "Neu"
      assert res["data"]["createTenant"]["categories"] == [%{"title" => "Startseite"}]
      res["data"]["createTenant"]["groups"]
      |> Enum.all?(fn group ->
        Enum.find(["Administrator", "Lehrer", "Schüler"], fn name ->
          group["name"] == name
        end) != nil
      end)

      tenant = Api.Tenants.get_tenant_by_slug("neu")

      assert tenant != nil

      assert Api.Accounts.User.is_admin?(user_account, tenant)
    end
  end

  describe "updateTenant mutation" do
    @query """
    mutation UpdateTenant($tenant: TenantInput!) {
      updateTenant(tenant: $tenant) {
        id
        slug
        title
      }
    }
    """

    test "upates title", %{web_tenant: web_tenant, admin_jwt: admin_jwt} do
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

    test "returns error if user is not admin", %{user_jwt: user_jwt} do
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

    test "returns error if user is not logged in" do
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

end
