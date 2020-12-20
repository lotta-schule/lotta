defmodule ApiWeb.SystemResolverTest do
  @moduledoc false

  alias ApiWeb.Auth.AccessToken
  alias Api.Repo
  alias Api.Accounts.User

  use ApiWeb.ConnCase, async: false

  setup do
    Repo.Seeder.seed()

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
       lotta_admin_account: lotta_admin,
       lotta_admin_jwt: lotta_admin_jwt,
       admin_account: admin,
       admin_jwt: admin_jwt,
       user_account: user,
       user_jwt: user_jwt
     }}
  end

  describe "system query" do
    @query """
    {
      system {
        slug
        title
      }
    }
    """

    test "returns current system configuration" do
      res =
        build_conn()
        |> put_req_header("origin", "https://lotta.web")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "system" => %{
                   "slug" => "web",
                   "title" => "Lotta"
                 }
               }
             }
    end
  end

  describe "get usage information" do
    @query """
    query getSystemUsage {
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
                 "filesTotal" => 25,
                 "usedTotal" => 295_625
               }
             } = current_usage
    end

    test "returns error if user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "usage" => nil
               },
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
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "usage" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["usage"]
                 }
               ]
             } = res
    end
  end

  describe "updateSystem mutation" do
    @query """
    mutation UpdateSystem($system: SystemInput!) {
      updateSystem(system: $system) {
        slug
        title
      }
    }
    """

    test "upates title", %{admin_jwt: admin_jwt} do
      system = %{
        title: "Web Beispiel Neu"
      }

      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{system: system})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateSystem" => %{
                   "slug" => "web",
                   "title" => "Web Beispiel Neu"
                 }
               }
             }
    end

    test "returns error if user is not admin", %{user_jwt: user_jwt} do
      system = %{
        title: "Web Beispiel Neu"
      }

      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{system: system})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateSystem" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["updateSystem"]
                 }
               ]
             } = res
    end

    test "returns error if user is not logged in" do
      system = %{
        title: "Web Beispiel Neu"
      }

      res =
        build_conn()
        |> post("/api", query: @query, variables: %{system: system})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateSystem" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["updateSystem"]
                 }
               ]
             } = res
    end
  end
end
