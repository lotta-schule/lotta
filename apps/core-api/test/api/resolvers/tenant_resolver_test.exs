defmodule Api.TenantResolverTest do
  @moduledoc """
    Test Module for TenantResolver
  """

  import Ecto.Query
  import ApiWeb.Accounts.Permissions

  alias ApiWeb.Auth.AccessToken
  alias Api.Repo
  alias Api.Accounts
  alias Api.Tenants
  alias Api.Accounts.{Directory, File, User, UserGroup}
  alias Api.Tenants.Category
  alias Api.Content.Article

  use ApiWeb.ConnCase, async: false

  setup do
    Repo.Seeder.seed()

    web_tenant = Tenants.get_tenant_by_slug!("web")
    lotta_admin = Repo.get_by!(User, email: "alexis.rinaldoni@einsa.net")
    admin = Repo.get_by!(User, email: "alexis.rinaldoni@lotta.schule")
    user = Repo.get_by!(User, email: "eike.wiewiorra@lotta.schule")

    {:ok, lotta_admin_jwt, _} =
      AccessToken.encode_and_sign(lotta_admin, %{
        email: lotta_admin.email,
        name: lotta_admin.name
      })

    {:ok, admin_jwt, _} =
      AccessToken.encode_and_sign(admin, %{email: admin.email, name: admin.name})

    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user, %{email: user.email, name: user.name})

    {:ok,
     %{
       web_tenant: web_tenant,
       lotta_admin_account: lotta_admin,
       lotta_admin_jwt: lotta_admin_jwt,
       admin_account: admin,
       admin_jwt: admin_jwt,
       user_account: user,
       user_jwt: user_jwt
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
      res =
        build_conn()
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "tenant" => nil
               }
             }
    end

    test "returns nil if slug tenant header and origin is not a known domain" do
      res =
        build_conn()
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
      res =
        build_conn()
        |> put_req_header("origin", "https://lotta.web")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "tenant" => %{
                   "id" => Integer.to_string(web_tenant.id),
                   "slug" => "web",
                   "title" => "Web Beispiel"
                 }
               }
             }
    end

    test "returns current tenant if slug is set in tenant header", %{web_tenant: web_tenant} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "tenant" => %{
                   "id" => Integer.to_string(web_tenant.id),
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
      res =
        build_conn()
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

  describe "get usage information" do
    @query """
    query getTenantUsage {
      usage {
        periodStart
        periodEnd
        storage {
          usedTotal
          filesTotal
        }
        media {
          mediaFilesTotal
          mediaFilesTotalDuration
          MediaConversionCurrentPeriod
        }
      }
    }
    """

    test "get duration information", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "usage" => []
               }
             }
    end

    test "returns error if user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "usage" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administratoren dürfen das.",
                   "path" => ["usage"]
                 }
               ]
             } = res
    end

    test "returns error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "usage" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administratoren dürfen das.",
                   "path" => ["usage"]
                 }
               ]
             } = res
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
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            title: "Neu",
            slug: "neu",
            email: "neuernutzer@lotta.schule",
            name: "Neuer Nutzer"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "createTenant" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Lotta-Administratoren dürfen das.",
                   "path" => ["createTenant"]
                 }
               ]
             } = res
    end

    test "should return an error if slug is taken", %{lotta_admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            title: "Neu",
            slug: "web",
            email: "neuernutzer@lotta.schule",
            name: "Neuer Nutzer"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "createTenant" => nil
               },
               "errors" => [
                 %{
                   "message" => "Lotta konnte nicht erstellt werden",
                   "path" => ["createTenant"],
                   "details" => %{
                     "slug" => ["ist schon belegt"]
                   }
                 }
               ]
             } = res
    end

    test "should create a tenant for a new admin", %{lotta_admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            title: "Neu",
            slug: "neu",
            email: "neuernutzer@lotta.schule",
            name: "Neuer Nutzer"
          }
        )
        |> json_response(200)

      assert res["data"]["createTenant"]["slug"] == "neu"
      assert res["data"]["createTenant"]["title"] == "Neu"

      assert res["data"]["createTenant"]["categories"] == [
               %{"title" => "Startseite"},
               %{"title" => "Erste Schritte"}
             ]

      res["data"]["createTenant"]["groups"]
      |> Enum.all?(fn group ->
        Enum.find(["Administrator", "Lehrer", "Schüler"], fn name ->
          group["name"] == name
        end) != nil
      end)

      tenant = Tenants.get_tenant_by_slug("neu")
      user = Accounts.get_user_by_email("neuernutzer@lotta.schule")

      assert tenant != nil
      assert user != nil

      assert user_is_admin?(user, tenant)
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
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            title: "Neu",
            slug: "web",
            email: "neuernutzer@lotta.schule",
            name: "Neuer Nutzer"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "createTenant" => nil
               },
               "errors" => [
                 %{
                   "message" => "Lotta konnte nicht erstellt werden",
                   "path" => ["createTenant"],
                   "details" => %{
                     "slug" => ["ist schon belegt"]
                   }
                 }
               ]
             } = res
    end

    test "should return an error if slug is 'intern'", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{title: "Neu", slug: "intern"})
        |> json_response(200)

      assert %{
               "data" => %{
                 "createTenant" => nil
               },
               "errors" => [
                 %{
                   "message" => "Lotta konnte nicht erstellt werden",
                   "path" => ["createTenant"],
                   "details" => %{
                     "slug" => ["ist schon belegt"]
                   }
                 }
               ]
             } = res
    end

    test "should return an error if user is already admin for a tenant", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{title: "Test-Schule", slug: "test-schule"})
        |> json_response(200)

      assert %{
               "data" => %{
                 "createTenant" => nil
               },
               "errors" => [
                 %{
                   "message" => "Der Nutzer ist schon Administrator bei lotta.",
                   "path" => ["createTenant"]
                 }
               ]
             } = res
    end

    test "should create a tenant for user", %{user_jwt: user_jwt, user_account: user_account} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            title: "Neu",
            slug: "neu"
          }
        )
        |> json_response(200)

      assert res["data"]["createTenant"]["slug"] == "neu"
      assert res["data"]["createTenant"]["title"] == "Neu"

      assert res["data"]["createTenant"]["categories"] == [
               %{"title" => "Startseite"},
               %{"title" => "Erste Schritte"}
             ]

      res["data"]["createTenant"]["groups"]
      |> Enum.all?(fn group ->
        Enum.find(["Administrator", "Lehrer", "Schüler"], fn name ->
          group["name"] == name
        end) != nil
      end)

      tenant = Tenants.get_tenant_by_slug("neu")

      assert tenant != nil

      assert user_is_admin?(user_account, tenant)
    end

    test "should create default content for a new tenant", %{
      user_jwt: user_jwt,
      user_account: user_account
    } do
      build_conn()
      |> put_req_header("authorization", "Bearer #{user_jwt}")
      |> post("/api",
        query: @query,
        variables: %{
          title: "Ein Test",
          slug: "ein-test"
        }
      )
      |> json_response(200)

      tenant = Tenants.get_tenant_by_slug("ein-test")
      assert tenant != nil
      # create default groups
      groups = Repo.all(from UserGroup, where: [tenant_id: ^tenant.id])
      assert Enum.count(groups) == 3
      # create a homepage and a default "welcome" category
      categories = Repo.all(from Category, where: [tenant_id: ^tenant.id])
      home_category = Enum.find(categories, fn category -> category.is_homepage end)
      assert !is_nil(home_category)
      assert Enum.count(categories, & &1.is_homepage) == 1
      assert Enum.count(categories, &(&1.title == "Erste Schritte")) == 1
      # create default shared directory
      shared_dir =
        Repo.one!(from d in Directory, where: d.tenant_id == ^tenant.id and is_nil(d.user_id))

      assert !is_nil(shared_dir)
      assert shared_dir.name == "Öffentliche Dateien"
      # should have created files in shared_dir
      shared_files =
        Repo.all(from File, where: [tenant_id: ^tenant.id, parent_directory_id: ^shared_dir.id])

      assert Enum.all?(shared_files, &(&1.user_id == user_account.id))
      assert Enum.count(shared_files)

      # should have created 3 articles
      articles = Repo.all(from Article, where: [tenant_id: ^tenant.id])

      other_category = Enum.find(categories, &(&1.id != home_category.id))
      assert !is_nil(other_category)

      assert Enum.all?(
               articles,
               &(&1.category_id == other_category.id)
             )

      assert Enum.count(articles, & &1.is_pinned_to_top) == 1
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

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{tenant: tenant})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateTenant" => %{
                   "id" => Integer.to_string(web_tenant.id),
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

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{tenant: tenant})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateTenant" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administratoren dürfen das.",
                   "path" => ["updateTenant"]
                 }
               ]
             } = res
    end

    test "returns error if user is not logged in" do
      tenant = %{
        title: "Web Beispiel Neu"
      }

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> post("/api", query: @query, variables: %{tenant: tenant})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateTenant" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administratoren dürfen das.",
                   "path" => ["updateTenant"]
                 }
               ]
             } = res
    end
  end
end
