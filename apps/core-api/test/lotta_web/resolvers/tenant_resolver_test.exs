defmodule LottaWeb.TenantResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: false

  import Ecto.Query

  alias LottaWeb.Auth.AccessToken
  alias Lotta.Accounts.User
  alias Lotta.{Repo, Tenants}

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Repo.put_prefix(@prefix)

    admin =
      Repo.one!(
        from(u in User, where: u.email == ^"alexis.rinaldoni@lotta.schule"),
        prefix: tenant.prefix
      )

    user =
      Repo.one!(
        from(u in User, where: u.email == ^"eike.wiewiorra@lotta.schule"),
        prefix: tenant.prefix
      )

    {:ok, admin_jwt, _} = AccessToken.encode_and_sign(admin)

    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)

    {:ok,
     %{
       admin_jwt: admin_jwt,
       user_jwt: user_jwt
     }}
  end

  describe "tenant query" do
    @query """
    {
      tenant {
        slug
        title
      }
    }
    """

    test "returns current tenant configuration identified by request 'tenant' header" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "tenant" => %{
                   "slug" => "test",
                   "title" => "Test Lotta"
                 }
               }
             }
    end

    test "returns current tenant configuration identified by request 'x-forwarded-host' header" do
      res =
        build_conn()
        |> put_req_header("x-forwarded-host", "test.lotta.schule")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "tenant" => %{
                   "slug" => "test",
                   "title" => "Test Lotta"
                 }
               }
             }
    end
  end

  describe "get tenant stats" do
    @query """
    {
      tenant {
        stats {
          userCount
          articleCount
          categoryCount
          fileCount
        }
      }
    }
    """
    test "returns error if user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "tenant" => %{"stats" => nil}
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["tenant", "stats"]
                 }
               ]
             } = res
    end

    test "returns error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "tenant" => %{"stats" => nil}
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["tenant", "stats"]
                 }
               ]
             } = res
    end

    test "returns stats", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "tenant" => %{
                   "stats" => %{
                     "userCount" => 8,
                     "articleCount" => 65,
                     "categoryCount" => 16,
                     "fileCount" => 27
                   }
                 }
               }
             } = res
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
          mediaConversionCurrentPeriod
        }
      }
    }
    """

    test "get duration information", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "usage" => [current_usage, _, _, _, _, _]
               }
             } = res

      assert %{
               "periodStart" => _start,
               "periodEnd" => _end,
               "media" => %{
                 "mediaConversionCurrentPeriod" => 480.9,
                 "mediaFilesTotal" => 3,
                 "mediaFilesTotalDuration" => 480.9
               },
               "storage" => %{
                 "filesTotal" => 27,
                 "usedTotal" => 17_076_953
               }
             } = current_usage
    end

    test "returns error if user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["usage"]
                 }
               ]
             } = res
    end

    test "returns error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["usage"]
                 }
               ]
             } = res
    end
  end

  describe "updateTenant mutation" do
    @query """
    mutation UpdateTenant($tenant: TenantInput!) {
      updateTenant(tenant: $tenant) {
        slug
        title
      }
    }
    """

    @configuration_query """
    mutation UpdateTenant($tenant: TenantInput!) {
      updateTenant(tenant: $tenant) {
        slug
        title
        configuration {
          isEmailRegistrationEnabled
          userMaxStorageConfig
        }
      }
    }
    """

    test "upates title", %{admin_jwt: admin_jwt} do
      tenant = %{
        title: "Web Beispiel Neu"
      }

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{tenant: tenant})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateTenant" => %{
                   "slug" => "test",
                   "title" => "Web Beispiel Neu"
                 }
               }
             }
    end

    test "updates email registration configuration", %{admin_jwt: admin_jwt} do
      tenant = %{
        configuration: %{
          isEmailRegistrationEnabled: false
        }
      }

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @configuration_query, variables: %{tenant: tenant})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateTenant" => %{
                   "slug" => "test",
                   "title" => "Test Lotta",
                   "configuration" => %{
                     "isEmailRegistrationEnabled" => false
                   }
                 }
               }
             } = res
    end

    test "returns default value for email registration when not set", %{admin_jwt: admin_jwt} do
      tenant = %{
        title: "Test Lotta"
      }

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @configuration_query, variables: %{tenant: tenant})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateTenant" => %{
                   "configuration" => %{
                     "isEmailRegistrationEnabled" => true
                   }
                 }
               }
             } = res
    end

    test "returns error if user is not admin", %{user_jwt: user_jwt} do
      tenant = %{
        title: "Web Beispiel Neu"
      }

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{tenant: tenant})
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
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
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query, variables: %{tenant: tenant})
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["updateTenant"]
                 }
               ]
             } = res
    end
  end
end
