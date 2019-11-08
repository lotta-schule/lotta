defmodule Api.UserResolverTest do
  use ApiWeb.ConnCase
  
  setup do
    Api.Repo.Seeder.seed()

    web_tenant = Api.Tenants.get_tenant_by_slug!("web")
    admin = Api.Repo.get_by!(Api.Accounts.User, [email: "alexis.rinaldoni@einsa.net"])
    user = Api.Repo.get_by!(Api.Accounts.User, [email: "eike.wiewiorra@einsa.net"])
    {:ok, admin_jwt, _} = Api.Guardian.encode_and_sign(admin, %{ email: admin.email, name: admin.name })
    {:ok, user_jwt, _} = Api.Guardian.encode_and_sign(user, %{ email: user.email, name: user.name })

    {:ok, %{
      web_tenant: web_tenant,
      admin: admin,
      admin_jwt: admin_jwt,
      user: user,
      user_jwt: user_jwt,
    }}
  end

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
  test "current_user field returns current_user if user is logged in", %{admin: admin, admin_jwt: admin_jwt} do
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
  test "current_user field returns null if user is not logged in" do
    res = build_conn()
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "currentUser" => nil
      }
    }
  end

  
  @query """
  {
    users {
      email
      name
      nickname
    }
  }
  """
  test "users field lists users if user is admin", %{admin_jwt: admin_jwt} do
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

  @query """
  {
    users {
      email
      name
      nickname
    }
  }
  """
  test "users field returns error if user is not admin", %{user_jwt: user_jwt} do
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


  @query """
  query searchUsers($searchtext: String!) {
    searchUsers(searchtext: $searchtext) {
      email
      name
      nickname
    }
  }
  """
  test "searchUsers field should find users of same tenant by name is user is admin", %{admin_jwt: admin_jwt} do
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

  @query """
  query searchUsers($searchtext: String!) {
    searchUsers(searchtext: $searchtext) {
      email
      name
      nickname
    }
  }
  """
  test "searchUsers field should find users of same tenant by nickname is user is admin", %{admin_jwt: admin_jwt} do
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

  @query """
  query searchUsers($searchtext: String!) {
    searchUsers(searchtext: $searchtext) {
      email
      name
      nickname
    }
  }
  """
  test "searchUsers field should find users of same tenant by exact email is user is admin", %{admin_jwt: admin_jwt} do
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

  @query """
  query searchUsers($searchtext: String!) {
    searchUsers(searchtext: $searchtext) {
      email
      name
      nickname
    }
  }
  """
  test "searchUsers field should return an empty results array if there is no match", %{admin_jwt: admin_jwt} do
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

  @query """
  query searchUsers($searchtext: String!) {
    searchUsers(searchtext: $searchtext) {
      email
      name
      nickname
    }
  }
  """
  test "searchUsers field should return an empty results array if there is a two-characters input", %{admin_jwt: admin_jwt} do
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

  @query """
  query searchUsers($searchtext: String!) {
    searchUsers(searchtext: $searchtext) {
      email
      name
      nickname
    }
  }
  """
  test "searchUsers field should throw an error if user is not admin", %{user_jwt: user_jwt} do
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

  @query """
  query searchUsers($searchtext: String!) {
    searchUsers(searchtext: $searchtext) {
      email
      name
      nickname
    }
  }
  """
  test "searchUsers field should throw an error if user is not logged in" do
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


  @query """
  query user($id: ID!) {
    user(id: $id) {
      email
      name
      nickname
    }
  }
  """
  test "user field should return user with requested id if user is admin", %{admin_jwt: admin_jwt, user: user} do
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

  @query """
  query user($id: ID!) {
    user(id: $id) {
      email
      name
      nickname
    }
  }
  """
  test "user field should return nil if user is admin, but requested id does not exist", %{admin_jwt: admin_jwt} do
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

  @query """
  query user($id: ID!) {
    user(id: $id) {
      email
      name
      nickname
    }
  }
  """
  test "user field should return an error if user is not an admin", %{user_jwt: user_jwt} do
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

  @query """
  query user($id: ID!) {
    user(id: $id) {
      email
      name
      nickname
    }
  }
  """
  test "user field should return an error if user is not logged in" do
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