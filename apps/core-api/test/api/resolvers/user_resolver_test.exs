defmodule Api.UserResolverTest do
  use ApiWeb.ConnCase

  setup do
    Api.Repo.Seeder.seed()

    web_tenant = Api.Tenants.get_tenant_by_slug!("web")
    admin = Api.Repo.get_by!(Api.Accounts.User, [email: "alexis.rinaldoni@einsa.net"])
    user = Api.Repo.get_by!(Api.Accounts.User, [email: "eike.wiewiorra@einsa.net"])
    user2 = Api.Repo.get_by!(Api.Accounts.User, [email: "mcurie@lotta.schule"])
    evil_user = Api.Repo.get_by!(Api.Accounts.User, [email: "drevil@lotta.schule"])
    {:ok, admin_jwt, _} = Api.Guardian.encode_and_sign(admin, %{ email: admin.email, name: admin.name })
    {:ok, user_jwt, _} = Api.Guardian.encode_and_sign(user, %{ email: user.email, name: user.name })
    schueler_group = Api.Repo.get_by!(Api.Accounts.UserGroup, name: "Schüler")
    lehrer_group = Api.Repo.get_by!(Api.Accounts.UserGroup, name: "Lehrer")

    {:ok, %{
      web_tenant: web_tenant,
      admin: admin,
      admin_jwt: admin_jwt,
      user: user,
      user2: user2,
      evil_user: evil_user,
      user_jwt: user_jwt,
      schueler_group: schueler_group,
      lehrer_group: lehrer_group
    }}
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
      res = build_conn()
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> get("/api", query: @query)
      |> json_response(200)

      assert res == %{
        "data" => %{
          "currentUser" => %{
              "id" => admin.id,
              "email" => "alexis.rinaldoni@einsa.net",
              "name" => "Alexis Rinaldoni",
              "nickname" => "Der Meister"
          }
        }
      }
    end
    test "returns null if user is not logged in" do
      res = build_conn()
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
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> get("/api", query: @query)
      |> json_response(200)

      assert res == %{
        "data" => %{
          "users" => [
              %{"email" => "alexis.rinaldoni@einsa.net", "name" => "Alexis Rinaldoni", "nickname" => "Der Meister"},
              %{"email" => "billy@einsa.net", "name" => "Christopher Bill", "nickname" => "Billy"},
              %{"email" => "eike.wiewiorra@einsa.net", "name" => "Eike Wiewiorra", "nickname" => "Chef"}
          ]
        }
      }
    end

    test "returns error if user is not admin", %{user_jwt: user_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{user_jwt}")
      |> get("/api", query: @query)
      |> json_response(200)

      assert res == %{
        "data" => %{
          "users" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Nur Administrator dürfen auf Benutzer auflisten.",
            "path" => ["users"]
          }
        ]
      }
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

    test "should find users of same tenant by name is user is admin", %{admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> get("/api", query: @query, variables: %{searchtext: "alexis"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "searchUsers" => [
              %{"email" => "alexis.rinaldoni@einsa.net", "name" => "Alexis Rinaldoni", "nickname" => "Der Meister"},
          ]
        }
      }
    end

    test "should find users of same tenant by nickname is user is admin", %{admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> get("/api", query: @query, variables: %{searchtext: "Meister"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "searchUsers" => [
              %{"email" => "alexis.rinaldoni@einsa.net", "name" => "Alexis Rinaldoni", "nickname" => "Der Meister"},
          ]
        }
      }
    end

    test "should find users of same tenant by exact email is user is admin", %{admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> get("/api", query: @query, variables: %{searchtext: "mcurie@lotta.schule"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "searchUsers" => [
              %{"email" => "mcurie@lotta.schule", "name" => "Marie Curie", "nickname" => "Polonium"}
          ]
        }
      }
    end

    test "should return an empty results array if there is no match", %{admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> get("/api", query: @query, variables: %{searchtext: "ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "searchUsers" => []
        }
      }
    end

    test "should return an empty results array if there is a two-characters input", %{admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> get("/api", query: @query, variables: %{searchtext: "De"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "searchUsers" => []
        }
      }
    end

    test "should throw an error if user is not admin", %{user_jwt: user_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{user_jwt}")
      |> get("/api", query: @query, variables: %{searchtext: "De"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "searchUsers" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Nur Administrator dürfen auf Benutzer auflisten.",
            "path" => ["searchUsers"]
          }
        ]
      }
    end

    test "should throw an error if user is not logged in" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> get("/api", query: @query, variables: %{searchtext: "De"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "searchUsers" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Nur Administrator dürfen auf Benutzer auflisten.",
            "path" => ["searchUsers"]
          }
        ]
      }
    end
  end


  describe "user query" do
    @query """
    query user($id: ID!) {
      user(id: $id) {
        email
        name
        nickname
      }
    }
    """

    test "should return user with requested id if user is admin", %{admin_jwt: admin_jwt, user: user} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> get("/api", query: @query, variables: %{id: user.id})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "user" => %{"email" => "eike.wiewiorra@einsa.net", "name" => "Eike Wiewiorra", "nickname" => "Chef"}
        }
      }
    end

    test "should return nil if user is admin, but requested id does not exist", %{admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> get("/api", query: @query, variables: %{id: 0})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "user" => nil,
        }
      }
    end

    test "should return an error if user is not an admin", %{user_jwt: user_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{user_jwt}")
      |> get("/api", query: @query, variables: %{id: 0})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "user" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Nur Administrator dürfen auf Benutzer auflisten.",
            "path" => ["user"]
          }
        ]
      }
    end

    test "should return an error if user is not logged in" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> get("/api", query: @query, variables: %{id: 0})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "user" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Nur Administrator dürfen auf Benutzer auflisten.",
            "path" => ["user"]
          }
        ]
      }
    end
  end


  describe "register mutation" do
    @query """
    mutation register($user: RegisterUserParams!, $groupKey: String) {
      register(user: $user, groupKey: $groupKey) {
        token
      }
    }
    """

    test "register the user if data is entered correctly" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{user: %{ name: "Neuer Nutzer", email: "neuernutzer@example.com", password: "test123" }})
      |> json_response(200)

      assert String.valid?(res["data"]["register"]["token"])
    end

    test "register the user and put him into groupkey's group" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{user: %{ name: "Neuer Nutzer", email: "neuernutzer@example.com", password: "test123" }, groupKey: "LEb0815Hp!1969"})
      |> json_response(200)

      assert String.valid?(res["data"]["register"]["token"])
      user_groups =
        Api.Accounts.User.get_groups(Api.Repo.get_by!(Api.Accounts.User, email: "neuernutzer@example.com"), Api.Repo.get_by!(Api.Tenants.Tenant, slug: "web"))
      [%{name: group_name}] = user_groups
      assert group_name == "Lehrer"
    end

    test "returns error when email is already taken" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{user: %{ name: "Neuer Nutzer", email: "alexis.rinaldoni@einsa.net", password: "test123" }, groupKey: "LEb0815Hp!1969"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "register" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Registrierung fehlgeschlagen.",
            "details" => %{"email" => ["ist schon belegt"]},
            "path" => ["register"]
          }
        ]
      }
    end

    test "returns error when no password is given" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{user: %{ name: "Neuer Nutzer", email: "alexis.rinaldoni@einsa.net", password: "" }, groupKey: "LEb0815Hp!1969"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "register" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Registrierung fehlgeschlagen.",
            "details" => %{"password" => ["darf nicht leer sein"]},
            "path" => ["register"]
          }
        ]
      }
    end

    test "returns error when no name is given" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{user: %{ name: "", email: "alexis.rinaldoni@einsa.net", password: "test123" }, groupKey: "LEb0815Hp!1969"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "register" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Registrierung fehlgeschlagen.",
            "details" => %{"name" => ["darf nicht leer sein"]},
            "path" => ["register"]
          }
        ]
      }
    end

    test "returns error when hide_full_name is selected but no nickname is given" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{user: %{ name: "Napoleon Bonaparte", email: "napoleon@bonaparte.fr", password: "test123", hide_full_name: true }})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "register" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Registrierung fehlgeschlagen.",
            "details" => %{"nickname" => ["darf nicht leer sein"]},
            "path" => ["register"]
          }
        ]
      }
    end
  end


  describe "login mutation" do
    @query """
    mutation login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        token
      }
    }
    """

    test "returns the user if data is entered correctly" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{username: "alexis.rinaldoni@einsa.net", password: "test123"})
      |> json_response(200)

      assert String.valid?(res["data"]["login"]["token"])
    end

    test "returns an error if the username is non-existent" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{username: "zzzzzzzzzzzzzzzzzzzz@bbbbbbbbbbbbbbb.ddd", password: "test123"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "login" => nil
          },
          "errors" => [
            %{
              "locations" => [%{"column" => 0, "line" => 2}],
              "message" => "Falsche Zugangsdaten.",
              "path" => ["login"]
            }
          ]
        }
      end

    test "returns an error if the password is wrong" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{username: "alexis.rinaldoni@einsa.net", password: "abcdef999"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "login" => nil
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Falsche Zugangsdaten.",
            "path" => ["login"]
          }
        ]
      }
    end

    test "returns an error if the user is blocked for this tenant" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{username: "drevil@lotta.schule", password: "test123"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "login" => nil
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Du wurdest für diese Seite geblockt. Du darfst dich nicht anmelden.",
            "path" => ["login"]
          }
        ]
      }
    end
  end

  describe "requestPasswordResetMutation" do
    @query """
    mutation requestPasswordReset($email: String!) {
      requestPasswordReset(email: $email)
    }
    """

    test "returns true if the user exists" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{email: "alexis.rinaldoni@einsa.net"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "requestPasswordReset" => true
        }
      }
      assert {:ok, 1} = Redix.command(:redix, ["EXISTS", "user-email-verify-token-alexis.rinaldoni@einsa.net"])
      Redix.command(:redix, ["FLUSHALL"])
    end

    test "returns true if the user does not exist" do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{email: "abcZZa@invalid.email"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "requestPasswordReset" => true
        }
      }
      assert {:ok, 0} = Redix.command(:redix, ["EXISTS", "user-email-verify-token-abcZZa@invalid.email"])
      Redix.command(:redix, ["FLUSHALL"])
    end
  end

  describe "resetPassword mutation" do
    @query """
    mutation resetPassword($email: String!, $token: String!, $password: String!) {
      resetPassword(email: $email, token: $token, password: $password) {
        token
      }
    }
    """

    test "returns an auth token if given user info is correct" do
      token = "abcdef123"
      Redix.command(:redix, ["SET", "user-email-verify-token-alexis.rinaldoni@einsa.net", token])
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{email: "alexis.rinaldoni@einsa.net", token: token, password: "abcdef"})
      |> json_response(200)

      user = Api.Repo.get_by!(Api.Accounts.User, [email: "alexis.rinaldoni@einsa.net"])

      assert String.valid?(res["data"]["resetPassword"]["token"])
      assert true = Bcrypt.verify_pass("abcdef", user.password_hash)
      Redix.command(:redix, ["FLUSHALL"])
    end

    test "returns an error if given token is not correct" do
      token = "abcdef123"
      Redix.command(:redix, ["SET", "user-email-verify-token-alexis.rinaldoni@einsa.net", token <> "blub"])
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{email: "alexis.rinaldoni@einsa.net", token: token, password: "abcdef"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "resetPassword" => nil
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Die Seite ist nicht mehr gültig. Starte den Vorgang erneut.",
            "path" => ["resetPassword"]
          }
        ]
      }
      Redix.command(:redix, ["FLUSHALL"])
    end

    test "returns an error if given email is not correct" do
      token = "abcdef123"
      Redix.command(:redix, ["SET", "user-email-verify-token-alexis.rinaldoni@einsa.net", token])
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> post("/api", query: @query, variables: %{email: "alexis.rinaldoni@blub.einsa.net", token: token, password: "abcdef"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "resetPassword" => nil
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Die Seite ist nicht mehr gültig. Starte den Vorgang erneut.",
            "path" => ["resetPassword"]
          }
        ]
      }
      Redix.command(:redix, ["FLUSHALL"])
    end
  end

  describe "setUserGroups mutation" do
    @query """
    mutation setUserGroups($id: ID!, $groupIds: [ID!]!) {
      setUserGroups(id: $id, groupIds: $groupIds) {
        email
        groups {
          name
        }
      }
    }
    """

    test "should return user with requested groups if user is admin", %{admin_jwt: admin_jwt, user2: user2, schueler_group: schueler_group, lehrer_group: lehrer_group} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{id: user2.id, groupIds: [schueler_group.id, lehrer_group.id]})
      |> json_response(200)

      assert res["data"]
      assert res["data"]["setUserGroups"]
      assert res["data"]["setUserGroups"]["email"] == "mcurie@lotta.schule"
      assert Enum.find(res["data"]["setUserGroups"]["groups"], fn %{"name" => name} -> name == "Schüler" end)
      assert Enum.find(res["data"]["setUserGroups"]["groups"], fn %{"name" => name} -> name == "Lehrer" end)
    end

    test "should return an error if user does not exist", %{admin_jwt: admin_jwt, schueler_group: schueler_group, lehrer_group: lehrer_group} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{id: 0, groupIds: [schueler_group.id, lehrer_group.id]})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "setUserGroups" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Nutzer mit der id 0 nicht gefunden.",
            "path" => ["setUserGroups"]
          }
        ]
      }
    end

    test "should return an error if user is not an admin", %{user_jwt: user_jwt, user2: user2, schueler_group: schueler_group, lehrer_group: lehrer_group} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{user_jwt}")
      |> post("/api", query: @query, variables: %{id: user2.id, groupIds: [schueler_group.id, lehrer_group.id]})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "setUserGroups" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Nur Administratoren dürfen Benutzern Gruppen zuweisen.",
            "path" => ["setUserGroups"]
          }
        ]
      }
    end
  end

  describe "setUserBlocked mutation" do
    @query """
    mutation setUserBlocked($id: ID!, $isBlocked: Boolean!) {
      setUserBlocked(id: $id, isBlocked: $isBlocked) {
        email
        isBlocked
      }
    }
    """

    test "should return blocked user when isBlocked is set to true and if user is admin, non-blocked user given", %{admin_jwt: admin_jwt, user2: user2} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{id: user2.id, isBlocked: true})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "setUserBlocked" => %{
            "email" => "mcurie@lotta.schule",
            "isBlocked" => true
          }
        }
      }
    end

    test "should return non-blocked user when isBlocked is set to false and if user is admin, non-blocked user given", %{admin_jwt: admin_jwt, user2: user2} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{id: user2.id, isBlocked: false})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "setUserBlocked" => %{
            "email" => "mcurie@lotta.schule",
            "isBlocked" => false
          }
        }
      }
    end

    test "should return blocked user when isBlocked is set to true and if user is admin, blocked user given", %{admin_jwt: admin_jwt, evil_user: evil_user} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{id: evil_user.id, isBlocked: true})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "setUserBlocked" => %{
            "email" => "drevil@lotta.schule",
            "isBlocked" => true
          }
        }
      }
    end

    test "should return non-blocked user when isBlocked is set to false and if user is admin, blocked user given", %{admin_jwt: admin_jwt, evil_user: evil_user} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{id: evil_user.id, isBlocked: false})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "setUserBlocked" => %{
            "email" => "drevil@lotta.schule",
            "isBlocked" => false
          }
        }
      }
    end

    test "should return an error if user is not an admin", %{user_jwt: user_jwt, evil_user: evil_user} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{user_jwt}")
      |> post("/api", query: @query, variables: %{id: evil_user.id, isBlocked: false})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "setUserBlocked" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Nur Administratoren dürfen Benutzer blocken.",
            "path" => ["setUserBlocked"]
          }
        ]
      }
    end

    test "should return an error if user does not exist", %{admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{id: 0, isBlocked: true})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "setUserBlocked" => nil,
        },
        "errors" => [
          %{
            "locations" => [%{"column" => 0, "line" => 2}],
            "message" => "Nutzer mit der id 0 nicht gefunden.",
            "path" => ["setUserBlocked"]
          }
        ]
      }
    end
  end
end
