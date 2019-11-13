defmodule Api.CategoryResolverTest do
  use ApiWeb.ConnCase
  
  setup do
    Api.Repo.Seeder.seed()

    web_tenant = Api.Tenants.get_tenant_by_slug!("web")
    faecher_category = Api.Repo.get_by!(Api.Tenants.Category, title: "Fächer")
    emails = [
      "alexis.rinaldoni@einsa.net", "eike.wiewiorra@einsa.net", "billy@einsa.net", "maxi@einsa.net"
    ]
    [{admin, admin_jwt}, {lehrer, lehrer_jwt}, {schueler, schueler_jwt}, {user, user_jwt}] = Enum.map(emails, fn email ->
      user = Api.Repo.get_by!(Api.Accounts.User, [email: email])
      {:ok, jwt, _} = Api.Guardian.encode_and_sign(user, %{ email: user.email, name: user.name })
      {user, jwt}
    end)

    {:ok, %{
      web_tenant: web_tenant,
      faecher_category: faecher_category,
      admin: admin,
      admin_jwt: admin_jwt,
      lehrer: lehrer,
      lehrer_jwt: lehrer_jwt,
      schueler: schueler,
      schueler_jwt: schueler_jwt,
      user: user,
      user_jwt: user_jwt,
    }}
  end

  @query """
  {
    categories {
      title
      sortKey
      groups {
        name
      }
      category {
        title
      }
    }
  }
  """
  test "categories field should return all categories for admin user", %{admin_jwt: admin_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{admin_jwt}")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "categories" => [
          %{"category" => nil, "sortKey" => 0, "groups" => [], "title" => "Start"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 10, "title" => "Podcast"},
          %{"groups" => [], "category" => %{"title" => "Fächer"}, "sortKey" => 10, "title" => "Sport"},
          %{"category" => nil, "groups" => [%{"name" => "Verwaltung"}], "sortKey" => 10, "title" => "Profil"},
          %{"groups" => [], "category" => %{"title" => "Profil"}, "sortKey" => 20, "title" => "Offene Kunst-AG"},
          %{"groups" => [], "category" => %{"title" => "Fächer"}, "sortKey" => 20, "title" => "Kunst"},
          %{"category" => nil, "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}, %{"name" => "Schüler"}], "sortKey" => 20, "title" => "GTA"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 30, "title" => "Schülerzeitung"},
          %{"category" => %{"title" => "Fächer"}, "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}], "sortKey" => 30, "title" => "Sprache"},
          %{"groups" => [], "category" => nil, "sortKey" => 30, "title" => "Projekt"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 40, "title" => "Oskar-Reime-Chor"},
          %{"category" => nil, "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}, %{"name" => "Schüler"}], "sortKey" => 40, "title" => "Fächer"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 50, "title" => "Schüler-Radio"},
          %{"category" => nil, "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}], "sortKey" => 50, "title" => "Material"},
          %{"groups" => [], "category" => nil, "sortKey" => 60, "title" => "Galerien"},
          %{"category" => nil, "groups" => [], "sortKey" => 70, "title" => "Impressum"}
        ]
      }
    }
  end

  @query """
  {
    categories {
      title
      sortKey
      groups {
        name
      }
      category {
        title
      }
    }
  }
  """
  test "categories field should return all categories for lehrer if user is in lehrer_group", %{lehrer_jwt: lehrer_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "categories" => [
          %{"category" => nil, "sortKey" => 0, "groups" => [], "title" => "Start"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 10, "title" => "Podcast"},
          %{"groups" => [], "category" => %{"title" => "Fächer"}, "sortKey" => 10, "title" => "Sport"},
          %{"groups" => [], "category" => %{"title" => "Profil"}, "sortKey" => 20, "title" => "Offene Kunst-AG"},
          %{"groups" => [], "category" => %{"title" => "Fächer"}, "sortKey" => 20, "title" => "Kunst"},
          %{"category" => nil, "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}, %{"name" => "Schüler"}], "sortKey" => 20, "title" => "GTA"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 30, "title" => "Schülerzeitung"},
          %{"category" => %{"title" => "Fächer"}, "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}], "sortKey" => 30, "title" => "Sprache"},
          %{"groups" => [], "category" => nil, "sortKey" => 30, "title" => "Projekt"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 40, "title" => "Oskar-Reime-Chor"},
          %{"category" => nil, "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}, %{"name" => "Schüler"}], "sortKey" => 40, "title" => "Fächer"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 50, "title" => "Schüler-Radio"},
          %{"category" => nil, "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}], "sortKey" => 50, "title" => "Material"},
          %{"groups" => [], "category" => nil, "sortKey" => 60, "title" => "Galerien"},
          %{"category" => nil, "groups" => [], "sortKey" => 70, "title" => "Impressum"}
        ]
      }
    }
  end
  
  @query """
  {
    categories {
      title
      sortKey
      groups {
        name
      }
      category {
        title
      }
    }
  }
  """
  test "categories field should return all categories for schueler if user is in schueler_group", %{schueler_jwt: schueler_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{schueler_jwt}")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "categories" => [
          %{"category" => nil, "sortKey" => 0, "groups" => [], "title" => "Start"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 10, "title" => "Podcast"},
          %{"groups" => [], "category" => %{"title" => "Fächer"}, "sortKey" => 10, "title" => "Sport"},
          %{"groups" => [], "category" => %{"title" => "Profil"}, "sortKey" => 20, "title" => "Offene Kunst-AG"},
          %{"groups" => [], "category" => %{"title" => "Fächer"}, "sortKey" => 20, "title" => "Kunst"},
          %{"category" => nil, "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}, %{"name" => "Schüler"}], "sortKey" => 20, "title" => "GTA"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 30, "title" => "Schülerzeitung"},
          %{"groups" => [], "category" => nil, "sortKey" => 30, "title" => "Projekt"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 40, "title" => "Oskar-Reime-Chor"},
          %{"category" => nil, "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}, %{"name" => "Schüler"}], "sortKey" => 40, "title" => "Fächer"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 50, "title" => "Schüler-Radio"},
          %{"groups" => [], "category" => nil, "sortKey" => 60, "title" => "Galerien"},
          %{"category" => nil, "groups" => [], "sortKey" => 70, "title" => "Impressum"}
        ]
      }
    }
  end

  @query """
  {
    categories {
      title
      sortKey
      groups {
        name
      }
      category {
        title
      }
    }
  }
  """
  test "categories field should return all categories with no groups if user has no groups", %{user_jwt: user_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{user_jwt}")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "categories" => [
          %{"category" => nil, "sortKey" => 0, "groups" => [], "title" => "Start"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 10, "title" => "Podcast"},
          %{"groups" => [], "category" => %{"title" => "Fächer"}, "sortKey" => 10, "title" => "Sport"},
          %{"groups" => [], "category" => %{"title" => "Profil"}, "sortKey" => 20, "title" => "Offene Kunst-AG"},
          %{"groups" => [], "category" => %{"title" => "Fächer"}, "sortKey" => 20, "title" => "Kunst"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 30, "title" => "Schülerzeitung"},
          %{"groups" => [], "category" => nil, "sortKey" => 30, "title" => "Projekt"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 40, "title" => "Oskar-Reime-Chor"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 50, "title" => "Schüler-Radio"},
          %{"groups" => [], "category" => nil, "sortKey" => 60, "title" => "Galerien"},
          %{"category" => nil, "groups" => [], "sortKey" => 70, "title" => "Impressum"}
        ]
      }
    }
  end
  
  @query """
  {
    categories {
      title
      sortKey
      groups {
        name
      }
      category {
        title
      }
    }
  }
  """
  test "categories field should return all categories with no groups if user is not logged in" do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "categories" => [
          %{"category" => nil, "sortKey" => 0, "groups" => [], "title" => "Start"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 10, "title" => "Podcast"},
          %{"groups" => [], "category" => %{"title" => "Fächer"}, "sortKey" => 10, "title" => "Sport"},
          %{"groups" => [], "category" => %{"title" => "Profil"}, "sortKey" => 20, "title" => "Offene Kunst-AG"},
          %{"groups" => [], "category" => %{"title" => "Fächer"}, "sortKey" => 20, "title" => "Kunst"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 30, "title" => "Schülerzeitung"},
          %{"groups" => [], "category" => nil, "sortKey" => 30, "title" => "Projekt"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 40, "title" => "Oskar-Reime-Chor"},
          %{"category" => %{"title" => "Profil"}, "groups" => [], "sortKey" => 50, "title" => "Schüler-Radio"},
          %{"groups" => [], "category" => nil, "sortKey" => 60, "title" => "Galerien"},
          %{"category" => nil, "groups" => [], "sortKey" => 70, "title" => "Impressum"}
        ]
      }
    }
  end


  @query """
  mutation ($id: ID!, $category: CategoryInput!) {
    updateCategory(id: $id, category: $category) {
      title
    }
  }
  """
  test "update category mutation should upate title and sortKey", %{admin_jwt: admin_jwt, faecher_category: faecher_category} do
    category = %{
      title: "Neue Fächer"
    }
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{admin_jwt}")
    |> post("/api", query: @query, variables: %{id: faecher_category.id, category: category})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "updateCategory" => %{
          "title" => "Neue Fächer"
        }
      }
    }
  end

  @query """
  mutation ($id: ID!, $category: CategoryInput!) {
    updateCategory(id: $id, category: $category) {
      title
    }
  }
  """
  test "update category mutation should return error if category does not exist", %{admin_jwt: admin_jwt} do
    category = %{
      title: "Neue Fächer"
    }
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{admin_jwt}")
    |> post("/api", query: @query, variables: %{id: 0, category: category})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "updateCategory" => nil
      },
      "errors" => [
        %{
          "locations" => [%{"column" => 0, "line" => 2}],
          "message" => "Kategorie mit der id 0 nicht gefunden.",
          "path" => ["updateCategory"]
        }
      ]
    }
  end

  @query """
  mutation ($id: ID!, $category: CategoryInput!) {
    updateCategory(id: $id, category: $category) {
      title
    }
  }
  """
  test "update category mutation should return error if user is not admin", %{user_jwt: user_jwt, faecher_category: faecher_category} do
    category = %{
      title: "Neue Fächer"
    }
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{user_jwt}")
    |> post("/api", query: @query, variables: %{id: faecher_category.id, category: category})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "updateCategory" => nil
      },
      "errors" => [
        %{
          "locations" => [%{"column" => 0, "line" => 2}],
          "message" => "Nur Administrator dürfen Kategorien bearbeiten.",
          "path" => ["updateCategory"]
        }
      ]
    }
  end

  @query """
  mutation ($id: ID!, $category: CategoryInput!) {
    updateCategory(id: $id, category: $category) {
      title
    }
  }
  """
  test "update tenant mutation should return error if user is not logged in", %{faecher_category: faecher_category} do
    category = %{
      title: "Neue Fächer"
    }
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> post("/api", query: @query, variables: %{id: faecher_category.id, category: category})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "updateCategory" => nil
      },
      "errors" => [
        %{
          "locations" => [%{"column" => 0, "line" => 2}],
          "message" => "Nur Administrator dürfen Kategorien bearbeiten.",
          "path" => ["updateCategory"]
        }
      ]
    }
  end
end