defmodule ApiWeb.UserResolverTest do
  @moduledoc false

  use ApiWeb.ConnCase
  use Bamboo.Test

  import Ecto.Query
  import Api.Accounts.Authentication

  alias ApiWeb.Auth.AccessToken
  alias Api.Repo
  alias Api.Repo.Seeder
  alias Api.Accounts.{Directory, File, User, UserGroup}

  setup do
    Seeder.seed()

    admin = Repo.get_by!(User, email: "alexis.rinaldoni@lotta.schule")
    user = Repo.get_by!(User, email: "eike.wiewiorra@lotta.schule")
    user2 = Repo.get_by!(User, email: "mcurie@lotta.schule")
    evil_user = Repo.get_by!(User, email: "drevil@lotta.schule")

    user_relevant_file = Repo.get_by!(File, filename: "wieartig1.jpg")

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
       evil_user: evil_user,
       user_jwt: user_jwt,
       schueler_group: schueler_group,
       lehrer_group: lehrer_group,
       user_relevant_file: user_relevant_file
     }}
  end

  describe "resolve name" do
    @query """
    query GetUser($id: ID!) {
      user(id: $id) {
        name
      }
    }
    """
    test "returns the user name for self", %{user: user, user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: user.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user" => %{
                   "name" => "Eike Wiewiorra"
                 }
               }
             }
    end

    test "returns the user name for admin", %{user: user, admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: user.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user" => %{
                   "name" => "Eike Wiewiorra"
                 }
               }
             }
    end

    test "returns the user name for others if user does not hide full name", %{
      user2: user2,
      user_jwt: user_jwt
    } do
      user2
      |> Ecto.Changeset.change(%{hide_full_name: false})
      |> Repo.update!()

      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: user2.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user" => %{
                   "name" => "Marie Curie"
                 }
               }
             }
    end

    test "returns nil for others if user does hide full name", %{
      user2: user2,
      user_jwt: user_jwt
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: user2.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user" => %{
                   "name" => nil
                 }
               }
             }
    end
  end

  describe "resolve email" do
    @query """
    query GetUser($id: ID!) {
      user(id: $id) {
        email
      }
    }
    """
    test "returns the user email for self", %{user: user, user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: user.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user" => %{
                   "email" => "eike.wiewiorra@lotta.schule"
                 }
               }
             }
    end

    test "returns the user email for admin", %{user: user, admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: user.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user" => %{
                   "email" => "eike.wiewiorra@lotta.schule"
                 }
               }
             }
    end

    test "does not return the user email for others", %{user2: user2, user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: user2.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user" => %{
                   "email" => nil
                 }
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 5, "line" => 3}],
                   "message" => "Die Email des Nutzers ist geheim.",
                   "path" => ["user", "email"]
                 }
               ]
             }
    end
  end

  describe "resolve last seen" do
    @query """
    query GetUser($id: ID!) {
      user(id: $id) {
        last_seen
      }
    }
    """
    test "returns the user last seen for self", %{user: user, user_jwt: user_jwt} do
      user
      |> Ecto.Changeset.change(%{last_seen: NaiveDateTime.local_now()})
      |> Repo.update!()

      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: user.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "user" => %{
                   "last_seen" => last_seen
                 }
               }
             } = res

      diff =
        NaiveDateTime.local_now()
        |> NaiveDateTime.diff(NaiveDateTime.from_iso8601!(last_seen), :second)

      # difference must be less than 1 minute
      assert diff < 60
    end

    test "returns the user last_seen for admin", %{user: user, admin_jwt: admin_jwt} do
      user
      |> Ecto.Changeset.change(%{last_seen: ~N[2020-11-14 00:00:00]})
      |> Repo.update!()

      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: user.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user" => %{
                   "last_seen" => "2020-11-14T00:00:00"
                 }
               }
             }
    end

    test "does not return the user last_seen for others", %{user2: user2, user_jwt: user_jwt} do
      user2
      |> Ecto.Changeset.change(%{last_seen: ~N[2020-11-14 00:00:00]})
      |> Repo.update!()

      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: user2.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user" => %{
                   "last_seen" => nil
                 }
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 5, "line" => 3}],
                   "message" => "Der Online-Status des Nutzers ist geheim.",
                   "path" => ["user", "last_seen"]
                 }
               ]
             }
    end
  end

  describe "resolve assigned_groups" do
    @query """
    query GetUser($id: ID!) {
      user(id: $id) {
        assigned_groups {
          id
          name
        }
      }
    }
    """
    test "returns the user assigned_groups for self", %{user: user, user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: user.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "user" => %{
                   "assigned_groups" => [%{"id" => _id, "name" => "Lehrer"}]
                 }
               }
             } = res
    end

    test "returns the user assigned_groups for admin", %{user: user, admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: user.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "user" => %{
                   "assigned_groups" => [%{"id" => _id, "name" => "Lehrer"}]
                 }
               }
             } = res
    end

    test "does return the user assigned_groups for others", %{user2: user2, user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: user2.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "user" => %{
                   "assigned_groups" => []
                 }
               }
             } = res
    end
  end

  describe "resolve groups" do
    @query """
    query GetUser($id: ID!) {
      user(id: $id) {
        groups {
          id
          name
        }
      }
    }
    """
    test "returns the user groups for self", %{user: user, user_jwt: user_jwt} do
      user
      |> Ecto.build_assoc(:enrollment_tokens)
      |> Ecto.Changeset.change(%{enrollment_token: "Seb034hP2?019"})
      |> Repo.insert!()

      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: user.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "user" => %{
                   "groups" => groups
                 }
               }
             } = res

      assert Enum.any?(groups, fn %{"name" => name} -> name == "Lehrer" end)
      assert Enum.any?(groups, fn %{"name" => name} -> name == "Schüler" end)
    end

    test "returns the user groups for admin", %{user: user, admin_jwt: admin_jwt} do
      user
      |> Ecto.build_assoc(:enrollment_tokens)
      |> Ecto.Changeset.change(%{enrollment_token: "Seb034hP2?019"})
      |> Repo.insert!()

      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: user.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "user" => %{
                   "groups" => groups
                 }
               }
             } = res

      assert Enum.any?(groups, fn %{"name" => name} -> name == "Lehrer" end)
      assert Enum.any?(groups, fn %{"name" => name} -> name == "Schüler" end)
    end

    test "does return the user groups for others", %{user2: user2, user_jwt: user_jwt} do
      user2
      |> Ecto.build_assoc(:enrollment_tokens)
      |> Ecto.Changeset.change(%{enrollment_token: "Seb034hP2?019"})
      |> Repo.insert!()

      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: user2.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "user" => %{
                   "groups" => groups
                 }
               }
             } = res

      assert Enum.any?(groups, fn %{"name" => name} -> name == "Schüler" end)
    end
  end

  describe "currentUser query" do
    @query """
    {
      currentUser {
        id
        email
        name
        nickname
      }
    }
    """

    test "returns current_user if user is logged in", %{admin: admin, admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "currentUser" => %{
                   "id" => Integer.to_string(admin.id),
                   "email" => "alexis.rinaldoni@lotta.schule",
                   "name" => "Alexis Rinaldoni",
                   "nickname" => "Der Meister"
                 }
               }
             }
    end

    test "returns null if user is not logged in" do
      res =
        build_conn()
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "currentUser" => nil
               }
             }
    end
  end

  describe "users query" do
    @query """
    {
      users {
        email
        name
        nickname
      }
    }
    """

    test "returns users list if user is admin", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "users" => [
                   %{
                     "email" => "alexis.rinaldoni@einsa.net",
                     "name" => "Alexis Rinaldoni",
                     "nickname" => nil
                   },
                   %{
                     "email" => "alexis.rinaldoni@lotta.schule",
                     "name" => "Alexis Rinaldoni",
                     "nickname" => "Der Meister"
                   },
                   %{
                     "email" => "billy@lotta.schule",
                     "name" => "Christopher Bill",
                     "nickname" => "Billy"
                   },
                   %{
                     "email" => "doro@lotta.schule",
                     "name" => "Dorothea Musterfrau",
                     "nickname" => "Doro"
                   },
                   %{
                     "email" => "drevil@lotta.schule",
                     "name" => "Dr Evil",
                     "nickname" => "drEvil"
                   },
                   %{
                     "email" => "eike.wiewiorra@lotta.schule",
                     "name" => "Eike Wiewiorra",
                     "nickname" => "Chef"
                   },
                   %{
                     "email" => "mcurie@lotta.schule",
                     "name" => "Marie Curie",
                     "nickname" => "Polonium"
                   },
                   %{
                     "email" => "maxi@lotta.schule",
                     "name" => "Max Mustermann",
                     "nickname" => "MaXi"
                   }
                 ]
               }
             }
    end

    test "returns error if user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "users" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["users"]
                 }
               ]
             } = res
    end
  end

  describe "searchUsers query" do
    @query """
    query searchUsers($searchtext: String!) {
      searchUsers(searchtext: $searchtext) {
        email
        name
        nickname
      }
    }
    """

    test "should find users by name is user is admin", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{searchtext: "alexis"})
        |> json_response(200)

      assert res["data"]["searchUsers"]

      assert Enum.find(res["data"]["searchUsers"], false, fn found_user ->
               found_user == %{
                 "email" => "alexis.rinaldoni@einsa.net",
                 "name" => "Alexis Rinaldoni",
                 "nickname" => nil
               }
             end)

      assert Enum.find(res["data"]["searchUsers"], false, fn found_user ->
               found_user == %{
                 "email" => "alexis.rinaldoni@lotta.schule",
                 "name" => "Alexis Rinaldoni",
                 "nickname" => "Der Meister"
               }
             end)
    end

    test "should find users by nickname is user is admin", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{searchtext: "Meister"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "searchUsers" => [
                   %{
                     "email" => "alexis.rinaldoni@lotta.schule",
                     "name" => "Alexis Rinaldoni",
                     "nickname" => "Der Meister"
                   }
                 ]
               }
             }
    end

    test "should find users by exact email is user is admin", %{
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{searchtext: "mcurie@lotta.schule"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "searchUsers" => [
                   %{
                     "email" => "mcurie@lotta.schule",
                     "name" => "Marie Curie",
                     "nickname" => "Polonium"
                   }
                 ]
               }
             }
    end

    test "should return an empty results array if there is no match", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api",
          query: @query,
          variables: %{searchtext: "ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ"}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "searchUsers" => []
               }
             }
    end

    test "should return an empty results array if there is a one-characters input", %{
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{searchtext: "D"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "searchUsers" => []
               }
             }
    end

    test "should throw an error if user is not logged in" do
      res =
        build_conn()
        |> get("/api", query: @query, variables: %{searchtext: "De"})
        |> json_response(200)

      assert %{
               "data" => %{
                 "searchUsers" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["searchUsers"]
                 }
               ]
             } = res
    end
  end

  describe "user query" do
    @query """
    query GetUser($id: ID!) {
      user(id: $id) {
        nickname
      }
    }
    """

    test "should return user with requested id if user is admin", %{
      admin_jwt: admin_jwt,
      user: user
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: user.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user" => %{
                   "nickname" => "Chef"
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
                 "user" => nil
               }
             }
    end

    test "should return user with requested id if user is not an admin", %{
      user: user,
      user_jwt: user_jwt
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: user.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "user" => %{
                   "nickname" => "Chef"
                 }
               }
             }
    end

    test "should return an error if user is not logged in" do
      res =
        build_conn()
        |> get("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert %{
               "data" => %{
                 "user" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["user"]
                 }
               ]
             } = res
    end
  end

  describe "register mutation" do
    @query """
    mutation register($user: RegisterUserParams!, $groupKey: String) {
      register(user: $user, groupKey: $groupKey) {
        access_token
      }
    }
    """

    test "register the user if data is entered correctly - user should have default directories" do
      conn =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{
            user: %{name: "Neuer Nutzer", email: "neuernutzer@example.com", password: "test123"}
          }
        )
        |> fetch_cookies(encrypted: ~w(SignInRefreshToken))

      res =
        conn
        |> json_response(200)

      token = conn.cookies["SignInRefreshToken"]
      assert String.valid?(token)
      {:ok, %{"email" => email}} = AccessToken.decode_and_verify(token)
      assert email == "neuernutzer@example.com"

      access_token = res["data"]["register"]["access_token"]
      assert String.valid?(access_token)

      {:ok, %{"sub" => id}} = AccessToken.decode_and_verify(access_token)

      directories =
        from(d in Directory, where: d.user_id == ^id)
        |> Repo.all()

      assert length(directories) == 5
    end

    test "register the user and put him into groupkey's group" do
      conn =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{
            user: %{name: "Neuer Nutzer", email: "neuernutzer@example.com", password: "test123"},
            groupKey: "LEb0815Hp!1969"
          }
        )
        |> fetch_cookies(encrypted: ~w(SignInRefreshToken))

      res =
        conn
        |> json_response(200)

      token = conn.cookies["SignInRefreshToken"]
      assert String.valid?(token)
      {:ok, %{"email" => email}} = AccessToken.decode_and_verify(token)
      assert email == "neuernutzer@example.com"

      access_token = res["data"]["register"]["access_token"]
      assert String.valid?(access_token)

      {:ok, %{"sub" => _id, "email" => "neuernutzer@example.com"}} =
        AccessToken.decode_and_verify(access_token)

      user =
        User
        |> Repo.get_by!(email: "neuernutzer@example.com")
        |> Repo.preload(:enrollment_tokens)

      user_groups =
        user.enrollment_tokens
        |> Enum.map(& &1.enrollment_token)
        |> Api.Accounts.list_groups_for_enrollment_tokens()

      [%{name: group_name}] = user_groups
      assert group_name == "Lehrer"
    end

    test "register the user and send him a registration mail" do
      build_conn()
      |> post("/api",
        query: @query,
        variables: %{
          user: %{name: "Neuer Nutzer", email: "neuernutzer@example.com", password: "test123"}
        }
      )
      |> json_response(200)

      user = Repo.get_by!(User, email: "neuernutzer@example.com")
      registration_mail = Api.Email.registration_mail(user)
      assert_delivered_email(registration_mail)
    end

    test "returns error when email is already taken" do
      res =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{
            user: %{
              name: "Neuer Nutzer",
              email: "alexis.rinaldoni@lotta.schule",
              password: "test123"
            },
            groupKey: "LEb0815Hp!1969"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "register" => nil
               },
               "errors" => [
                 %{
                   "message" => "Registrierung fehlgeschlagen.",
                   "details" => %{"email" => ["ist schon belegt"]},
                   "path" => ["register"]
                 }
               ]
             } = res
    end

    test "returns error when no password is given" do
      res =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{
            user: %{name: "Neuer Nutzer", email: "alexis.rinaldoni@lotta.schule", password: ""},
            groupKey: "LEb0815Hp!1969"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "register" => nil
               },
               "errors" => [
                 %{
                   "message" => "Registrierung fehlgeschlagen.",
                   "details" => %{"password" => ["darf nicht leer sein"]},
                   "path" => ["register"]
                 }
               ]
             } = res
    end

    test "returns error when no name is given" do
      res =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{
            user: %{name: "", email: "alexis.rinaldoni@lotta.schule", password: "test123"},
            groupKey: "LEb0815Hp!1969"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "register" => nil
               },
               "errors" => [
                 %{
                   "message" => "Registrierung fehlgeschlagen.",
                   "details" => %{"name" => ["darf nicht leer sein"]},
                   "path" => ["register"]
                 }
               ]
             } = res
    end

    test "returns error when hide_full_name is selected but no nickname is given" do
      res =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{
            user: %{
              name: "Napoleon Bonaparte",
              email: "napoleon@bonaparte.fr",
              password: "test123",
              hide_full_name: true
            }
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "register" => nil
               },
               "errors" => [
                 %{
                   "message" => "Registrierung fehlgeschlagen.",
                   "details" => %{"nickname" => ["darf nicht leer sein"]},
                   "path" => ["register"]
                 }
               ]
             } = res
    end
  end

  describe "login mutation" do
    @query """
    mutation login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        access_token
      }
    }
    """

    test "returns the user if data is entered correctly" do
      conn =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{username: "alexis.rinaldoni@lotta.schule", password: "test123"}
        )
        |> fetch_cookies(encrypted: ~w(SignInRefreshToken))

      res =
        conn
        |> json_response(200)

      token = conn.cookies["SignInRefreshToken"]
      assert String.valid?(token)

      {:ok, %{"email" => email, "typ" => "refresh"}} = AccessToken.decode_and_verify(token)

      assert email == "alexis.rinaldoni@lotta.schule"

      access_token = res["data"]["login"]["access_token"]
      assert String.valid?(access_token)

      {:ok, %{"sub" => _id, "email" => "alexis.rinaldoni@lotta.schule"}} =
        AccessToken.decode_and_verify(access_token)
    end

    test "returns an error if the username is non-existent" do
      res =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{username: "zzzzzzzzzzzzzzzzzzzz@bbbbbbbbbbbbbbb.ddd", password: "test123"}
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "login" => nil
               },
               "errors" => [
                 %{
                   "message" => "Falsche Zugangsdaten.",
                   "path" => ["login"]
                 }
               ]
             } = res
    end

    test "returns an error if the password is wrong" do
      res =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{username: "alexis.rinaldoni@lotta.schule", password: "abcdef999"}
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "login" => nil
               },
               "errors" => [
                 %{
                   "message" => "Falsche Zugangsdaten.",
                   "path" => ["login"]
                 }
               ]
             } = res
    end

  end

  describe "requestPasswordResetMutation" do
    @query """
    mutation requestPasswordReset($email: String!) {
      requestPasswordReset(email: $email)
    }
    """

    test "returns true and create a token for the database if the user exists" do
      res =
        build_conn()
        |> post("/api", query: @query, variables: %{email: "alexis.rinaldoni@lotta.schule"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "requestPasswordReset" => true
               }
             }

      assert {:ok, 1} =
               Redix.command(:redix, [
                 "EXISTS",
                 "user-email-verify-token-alexis.rinaldoni@lotta.schule"
               ])

      Redix.command(:redix, ["FLUSHALL"])
    end

    test "send the token via email" do
      res =
        build_conn()
        |> post("/api", query: @query, variables: %{email: "alexis.rinaldoni@lotta.schule"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "requestPasswordReset" => true
               }
             }

      assert {:ok, token} =
               Redix.command(:redix, [
                 "GET",
                 "user-email-verify-token-alexis.rinaldoni@lotta.schule"
               ])

      Redix.command(:redix, ["FLUSHALL"])

      user = Repo.get_by!(User, email: "alexis.rinaldoni@lotta.schule")
      token_mail = Api.Email.request_password_reset_mail(user, token)
      assert_delivered_email(token_mail)
    end

    test "returns true if the user does not exist" do
      res =
        build_conn()
        |> post("/api", query: @query, variables: %{email: "abcZZa@invalid.email"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "requestPasswordReset" => true
               }
             }

      assert {:ok, 0} =
               Redix.command(:redix, ["EXISTS", "user-email-verify-token-abcZZa@invalid.email"])

      Redix.command(:redix, ["FLUSHALL"])
    end
  end

  test "returns true and create a token for the database if the user exists but is written in the wrong case" do
    res =
      build_conn()
      |> post("/api", query: @query, variables: %{email: "AleXis.Rinaldoni@LOTTA.SCHULE"})
      |> json_response(200)

    assert res == %{
             "data" => %{
               "requestPasswordReset" => true
             }
           }

    assert {:ok, 1} =
             Redix.command(:redix, [
               "EXISTS",
               "user-email-verify-token-alexis.rinaldoni@lotta.schule"
             ])

    Redix.command(:redix, ["FLUSHALL"])
  end

  describe "resetPassword mutation" do
    @query """
    mutation resetPassword($email: String!, $token: String!, $password: String!) {
      resetPassword(email: $email, token: $token, password: $password) {
        access_token
      }
    }
    """

    test "returns an auth token if given user info is correct" do
      token = "abcdef123"

      Redix.command(:redix, [
        "SET",
        "user-email-verify-token-alexis.rinaldoni@lotta.schule",
        token
      ])

      conn =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{email: "alexis.rinaldoni@lotta.schule", token: token, password: "abcdef"}
        )
        |> fetch_cookies(encrypted: ~w(SignInRefreshToken))

      res =
        conn
        |> json_response(200)

      token = conn.cookies["SignInRefreshToken"]
      assert String.valid?(token)
      {:ok, %{"email" => email}} = AccessToken.decode_and_verify(token)
      assert email == "alexis.rinaldoni@lotta.schule"

      access_token = res["data"]["resetPassword"]["access_token"]
      assert String.valid?(access_token)

      {:ok, %{"sub" => _id, "email" => "alexis.rinaldoni@lotta.schule"}} =
        AccessToken.decode_and_verify(access_token)

      user = Repo.get_by!(User, email: "alexis.rinaldoni@lotta.schule")

      assert String.valid?(res["data"]["resetPassword"]["access_token"])
      assert Argon2.verify_pass("abcdef", user.password_hash)
      Redix.command(:redix, ["FLUSHALL"])
    end

    test "returns an error if given token is not correct" do
      token = "abcdef123"

      Redix.command(:redix, [
        "SET",
        "user-email-verify-token-alexis.rinaldoni@lotta.schule",
        token <> "blub"
      ])

      res =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{email: "alexis.rinaldoni@lotta.schule", token: token, password: "abcdef"}
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "resetPassword" => nil
               },
               "errors" => [
                 %{
                   "message" => "Die Seite ist nicht mehr gültig. Starte den Vorgang erneut.",
                   "path" => ["resetPassword"]
                 }
               ]
             } = res

      Redix.command(:redix, ["FLUSHALL"])
    end

    test "returns an error if given email is not correct" do
      token = "abcdef123"

      Redix.command(:redix, [
        "SET",
        "user-email-verify-token-alexis.rinaldoni@lotta.schule",
        token
      ])

      res =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{email: "alexis.rinaldoni@blub.einsa.net", token: token, password: "abcdef"}
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "resetPassword" => nil
               },
               "errors" => [
                 %{
                   "message" => "Die Seite ist nicht mehr gültig. Starte den Vorgang erneut.",
                   "path" => ["resetPassword"]
                 }
               ]
             } = res

      Redix.command(:redix, ["FLUSHALL"])
    end
  end

  describe "updateUser mutation" do
    @query """
    mutation updateUser($id: ID!, $groups: [SelectUserGroupInput!], $isBlocked: Boolean) {
      updateUser(id: $id, groups: $groups, isBlocked: $isBlocked) {
        email
        isBlocked
        groups {
          name
        }
      }
    }
    """
    test "should return user with requested groups if user is admin", %{
      admin_jwt: admin_jwt,
      user2: user2,
      schueler_group: schueler_group,
      lehrer_group: lehrer_group
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2.id, groups: [%{id: schueler_group.id}, %{id: lehrer_group.id}]}
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateUser" => %{
                   "email" => "mcurie@lotta.schule",
                   "isBlocked" => false,
                   "groups" => groups
                 }
               }
             } = res

      assert Enum.any?(groups, &(Map.get(&1, "name") == "Schüler"))
      assert Enum.any?(groups, &(Map.get(&1, "name") == "Lehrer"))
    end

    test "should return an error if user does not exist", %{
      admin_jwt: admin_jwt,
      schueler_group: schueler_group,
      lehrer_group: lehrer_group
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: 0, groups: [%{id: schueler_group.id}, %{id: lehrer_group.id}]}
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateUser" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nutzer mit der id 0 nicht gefunden.",
                   "path" => ["updateUser"]
                 }
               ]
             } = res
    end

    test "should return an error if user is not an admin", %{
      user_jwt: user_jwt,
      user2: user2,
      schueler_group: schueler_group,
      lehrer_group: lehrer_group
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2.id, groups: [%{id: schueler_group.id}, %{id: lehrer_group.id}]}
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateUser" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["updateUser"]
                 }
               ]
             } = res
    end
  end

  describe "a user can update his password with a correct password mutation" do
    @query """
    mutation UpdateProfile($user: UpdateUserParams!) {
      updateProfile(user: $user) {
        name
        nickname
      }
    }
    """
    test "should update a users name and nickname", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{user: %{name: "Neuer Name", nickname: "Dr New"}}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateProfile" => %{
                   "name" => "Neuer Name",
                   "nickname" => "Dr New"
                 }
               }
             }
    end

    test "should return an error when it the user is not logged in" do
      res =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{user: %{name: "Neuer Name", nickname: "Dr New"}}
        )
        |> json_response(200)

      assert %{
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["updateProfile"]
                 }
               ],
               "data" => %{"updateProfile" => nil}
             } = res
    end
  end

  describe "a user can update his profile" do
    @query """
    mutation updatePassword($currentPassword: String!, $newPassword: String!) {
      updatePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
        name
      }
    }
    """
    test "should update a users password", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{currentPassword: "test123", newPassword: "test456"}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updatePassword" => %{
                   "name" => "Eike Wiewiorra"
                 }
               }
             }

      assert {:ok, _} = login_with_username_pass("eike.wiewiorra@lotta.schule", "test456")
    end

    test "should return an error when the current password is not correct", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{currentPassword: "test000", newPassword: "test456"}
        )
        |> json_response(200)

      assert %{
               "errors" => [
                 %{
                   "message" => "Falsche Zugangsdaten.",
                   "path" => ["updatePassword"]
                 }
               ],
               "data" => %{"updatePassword" => nil}
             } = res
    end

    test "should return an error when the new password is too short", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{currentPassword: "test123", newPassword: "abc"}
        )
        |> json_response(200)

      assert %{
               "data" => %{"updatePassword" => nil},
               "errors" => [
                 %{
                   "details" => %{"password" => ["sollte mindestens 6 Zeichen lang sein"]},
                   "message" => "Passwort ändern fehlgeschlagen.",
                   "path" => ["updatePassword"]
                 }
               ]
             } = res
    end
  end

  describe "destroy account mutation" do
    @query """
    mutation DestroyAccountMutation($transferFileIds: [ID!]) {
      destroyAccount(transferFileIds: $transferFileIds) {
        email
      }
    }
    """
    test "should return an error when user is not logged in", %{user_relevant_file: file} do
      res =
        build_conn()
        |> post("/api",
          query: @query,
          variables: %{transferFileIds: [file.id]}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{"destroyAccount" => nil},
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["destroyAccount"],
                   "locations" => [%{"column" => 3, "line" => 2}]
                 }
               ]
             }
    end

    test "should successfully destroy the account without transferring files", %{
      user_jwt: user_jwt,
      user: user
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "destroyAccount" => %{
                   "email" => "eike.wiewiorra@lotta.schule"
                 }
               }
             } = res

      assert_raise Ecto.NoResultsError, fn ->
        Repo.get!(User, user.id)
      end
    end

    test "should successfully destroy the account, transferring files", %{
      user_jwt: user_jwt,
      user: user,
      user_relevant_file: file
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{transferFileIds: [file.id]}
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "destroyAccount" => %{
                   "email" => "eike.wiewiorra@lotta.schule"
                 }
               }
             } = res

      assert_raise Ecto.NoResultsError, fn ->
        Repo.get!(User, user.id)
      end

      refetched_file = Repo.get!(File, file.id)
      refute refetched_file.user_id
    end

    test "should successfully destroy the account, ignoring invalid file ids", %{
      user_jwt: user_jwt,
      user: user,
      user_relevant_file: file
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{transferFileIds: [1, file.id]}
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "destroyAccount" => %{
                   "email" => "eike.wiewiorra@lotta.schule"
                 }
               }
             } = res

      assert_raise Ecto.NoResultsError, fn ->
        Repo.get!(User, user.id)
      end

      refetched_file = Repo.get!(File, file.id)
      refute refetched_file.user_id
    end
  end
end
