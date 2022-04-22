defmodule LottaWeb.UserGroupResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Ecto.Query

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Accounts, Repo, Tenants}
  alias Lotta.Accounts.{User, UserGroup}

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    admin =
      Repo.one!(from(u in User, where: u.email == ^"alexis.rinaldoni@lotta.schule"),
        prefix: tenant.prefix
      )

    user =
      Repo.one!(from(u in User, where: u.email == ^"eike.wiewiorra@lotta.schule"),
        prefix: tenant.prefix
      )

    user2 =
      Repo.one!(from(u in User, where: u.email == ^"mcurie@lotta.schule"), prefix: tenant.prefix)

    {:ok, admin_jwt, _} = AccessToken.encode_and_sign(admin)

    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)

    schueler_group =
      Repo.one!(
        from(ug in UserGroup,
          where: ug.name == ^"Schüler"
        ),
        prefix: tenant.prefix
      )

    lehrer_group =
      Repo.one!(
        from(ug in UserGroup,
          where: ug.name == ^"Lehrer"
        ),
        prefix: tenant.prefix
      )

    {:ok,
     %{
       admin: admin,
       admin_jwt: admin_jwt,
       user: user,
       user2: user2,
       user_jwt: user_jwt,
       schueler_group: schueler_group,
       lehrer_group: lehrer_group,
       tenant: tenant
     }}
  end

  describe "get all groups query" do
    @query """
    query GetGroups {
      user_groups {
        name
      }
    }
    """

    test "anonymous user should get an empty list" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user_groups" => []
               }
             }
    end

    test "admin user should get all groups", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user_groups" => [
                   %{"name" => "Administration"},
                   %{"name" => "Verwaltung"},
                   %{"name" => "Lehrer"},
                   %{"name" => "Schüler"}
                 ]
               }
             }
    end

    test "user should only get his own groups", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user_groups" => [
                   %{"name" => "Lehrer"}
                 ]
               }
             }
    end
  end

  describe "group query" do
    @query """
    query group($id: ID!) {
      group(id: $id) {
        name
        enrollmentTokens
      }
    }
    """

    test "should return group with requested", %{admin_jwt: admin_jwt, lehrer_group: lehrer_group} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: lehrer_group.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "group" => %{
                   "name" => "Lehrer",
                   "enrollmentTokens" => ["LEb0815Hp!1969"]
                 }
               }
             }
    end

    test "should return nil if user is admin, but requested id does not exist", %{
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "group" => nil
               }
             }
    end

    test "should return an error if user is not an admin", %{
      user_jwt: user_jwt,
      lehrer_group: lehrer_group
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: lehrer_group.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "group" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["group"]
                 }
               ]
             } = res
    end

    test "should return an error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert %{
               "data" => %{
                 "group" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["group"]
                 }
               ]
             } = res
    end
  end

  describe "UpdateUserGroup mutation" do
    @query """
    mutation UpdateUserGroup($id: ID!, $group: UserGroupInput!) {
      UpdateUserGroup(id: $id, group: $group) {
        name
        enrollmentTokens
      }
    }
    """

    test "should update group", %{admin_jwt: admin_jwt, lehrer_group: lehrer_group} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: lehrer_group.id,
            group: %{"name" => "Die Lehrer", "enrollmentTokens" => ["L1", "L2"]}
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "UpdateUserGroup" => %{
                   "name" => "Die Lehrer",
                   "enrollmentTokens" => ["L1", "L2"]
                 }
               }
             }
    end

    test "should return an error if user is admin, but requested id does not exist", %{
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: 0,
            group: %{"name" => "Die Lehrer", "enrollmentTokens" => ["L1", "L2"]}
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "UpdateUserGroup" => nil
               },
               "errors" => [
                 %{
                   "message" => "Gruppe mit der id 0 existiert nicht.",
                   "path" => ["UpdateUserGroup"]
                 }
               ]
             } = res
    end

    test "should return an error if user is not an admin", %{
      user_jwt: user_jwt,
      lehrer_group: lehrer_group
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: lehrer_group.id,
            group: %{"name" => "Die Lehrer", "enrollmentTokens" => ["L1", "L2"]}
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "UpdateUserGroup" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["UpdateUserGroup"]
                 }
               ]
             } = res
    end

    test "should return an error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api",
          query: @query,
          variables: %{
            id: 0,
            group: %{"name" => "Die Lehrer", "enrollmentTokens" => ["L1", "L2"]}
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "UpdateUserGroup" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["UpdateUserGroup"]
                 }
               ]
             } = res
    end
  end

  describe "deleteUserGroup mutation" do
    @query """
    mutation deleteUserGroup($id: ID!) {
      deleteUserGroup(id: $id) {
        name
      }
    }
    """

    test "should delete group", %{admin_jwt: admin_jwt, lehrer_group: lehrer_group} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: lehrer_group.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteUserGroup" => %{"name" => "Lehrer"}
               }
             }

      assert Accounts.get_user_group(lehrer_group.id) == nil
    end

    test "should return an error if user is admin, but requested id does not exist", %{
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert %{
               "data" => %{
                 "deleteUserGroup" => nil
               },
               "errors" => [
                 %{
                   "message" => "Gruppe existiert nicht.",
                   "path" => ["deleteUserGroup"]
                 }
               ]
             } = res
    end

    test "should return an error if user is not an admin", %{
      user_jwt: user_jwt,
      lehrer_group: lehrer_group
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: lehrer_group.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "deleteUserGroup" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["deleteUserGroup"]
                 }
               ]
             } = res
    end

    test "should return an error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert %{
               "data" => %{
                 "deleteUserGroup" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["deleteUserGroup"]
                 }
               ]
             } = res
    end
  end

  describe "createUserGroup mutation" do
    @query """
    mutation createUserGroup($group: UserGroupInput!) {
      createUserGroup(group: $group) {
        name
        enrollmentTokens
      }
    }
    """

    test "should create group", %{admin_jwt: admin_jwt, lehrer_group: lehrer_group} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: lehrer_group.id,
            group: %{"name" => "Die Lehrer", "enrollmentTokens" => ["L1", "L2"]}
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createUserGroup" => %{
                   "name" => "Die Lehrer",
                   "enrollmentTokens" => ["L1", "L2"]
                 }
               }
             }
    end

    test "should return an error if user is not an admin", %{
      user_jwt: user_jwt,
      lehrer_group: lehrer_group
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: lehrer_group.id,
            group: %{"name" => "Die Lehrer", "enrollmentTokens" => ["L1", "L2"]}
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "createUserGroup" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["createUserGroup"]
                 }
               ]
             } = res
    end

    test "should return an error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api",
          query: @query,
          variables: %{
            id: 0,
            group: %{"name" => "Die Lehrer", "enrollmentTokens" => ["L1", "L2"]}
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "createUserGroup" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["createUserGroup"]
                 }
               ]
             } = res
    end
  end
end
