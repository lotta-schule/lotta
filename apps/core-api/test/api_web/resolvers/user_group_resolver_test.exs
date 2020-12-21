defmodule ApiWeb.UserGroupResolverTest do
  @moduledoc false

  use ApiWeb.ConnCase

  alias ApiWeb.Auth.AccessToken
  alias Api.Repo
  alias Api.Repo.Seeder
  alias Api.Accounts
  alias Api.Accounts.{User, UserGroup}

  setup do
    Seeder.seed()

    admin = Repo.get_by!(User, email: "alexis.rinaldoni@lotta.schule")
    user = Repo.get_by!(User, email: "eike.wiewiorra@lotta.schule")
    user2 = Repo.get_by!(User, email: "mcurie@lotta.schule")

    {:ok, admin_jwt, _} =
      AccessToken.encode_and_sign(admin, %{email: admin.email, name: admin.name})

    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user, %{email: user.email, name: user.name})

    schueler_group = Repo.get_by!(UserGroup, name: "Schüler")
    lehrer_group = Repo.get_by!(UserGroup, name: "Lehrer")

    {:ok,
     %{
       admin: admin,
       admin_jwt: admin_jwt,
       user: user,
       user2: user2,
       user_jwt: user_jwt,
       schueler_group: schueler_group,
       lehrer_group: lehrer_group
     }}
  end

  describe "get all groups query" do
    @query """
    query system {
      system {
        groups {
          name
        }
      }
    }
    """

    test "anonymous user should get an empty list" do
      res =
        build_conn()
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "system" => %{"groups" => []}
               }
             }
    end

    test "admin user should get all groups", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "system" => %{
                   "groups" => [
                     %{"name" => "Administration"},
                     %{"name" => "Verwaltung"},
                     %{"name" => "Lehrer"},
                     %{"name" => "Schüler"}
                   ]
                 }
               }
             }
    end

    test "user should only get his own groups", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "system" => %{
                   "groups" => [
                     %{"name" => "Lehrer"}
                   ]
                 }
               }
             }
    end
  end

  describe "group query" do
    @query """
    query group($id: ID!) {
      group(id: $id) {
        name
        enrollmentTokens {
          token
        }
      }
    }
    """

    test "should return group with requested", %{admin_jwt: admin_jwt, lehrer_group: lehrer_group} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: lehrer_group.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "group" => %{
                   "name" => "Lehrer",
                   "enrollmentTokens" => [%{"token" => "LEb0815Hp!1969"}]
                 }
               }
             }
    end

    test "should return nil if user is admin, but requested id does not exist", %{
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
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
        enrollmentTokens {
          token
        }
      }
    }
    """

    test "should update group", %{admin_jwt: admin_jwt, lehrer_group: lehrer_group} do
      res =
        build_conn()
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
                   "enrollmentTokens" => [%{"token" => "L1"}, %{"token" => "L2"}]
                 }
               }
             }
    end

    test "should return an error if user is admin, but requested id does not exist", %{
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
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
        enrollmentTokens {
          token
        }
      }
    }
    """

    test "should create group", %{admin_jwt: admin_jwt, lehrer_group: lehrer_group} do
      res =
        build_conn()
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
                   "enrollmentTokens" => [%{"token" => "L1"}, %{"token" => "L2"}]
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
