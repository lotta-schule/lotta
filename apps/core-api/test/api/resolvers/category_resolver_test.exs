defmodule Api.CategoryResolverTest do
  @moduledoc """
    Test Module for CategoryResolver
  """

  use ApiWeb.ConnCase

  import Ecto.Query

  alias ApiWeb.Auth.AccessToken
  alias Api.Repo
  alias Api.Tenants
  alias Api.Accounts.User
  alias Api.Tenants.Category
  alias Api.Content.Article

  setup do
    Repo.Seeder.seed()

    web_tenant = Tenants.get_tenant_by_slug!("web")
    faecher_category = Repo.get_by!(Category, title: "Fächer")

    emails = [
      "alexis.rinaldoni@lotta.schule",
      "eike.wiewiorra@lotta.schule",
      "billy@lotta.schule",
      "maxi@lotta.schule"
    ]

    [{admin, admin_jwt}, {lehrer, lehrer_jwt}, {schueler, schueler_jwt}, {user, user_jwt}] =
      Enum.map(emails, fn email ->
        user = Repo.get_by!(User, email: email)
        {:ok, jwt, _} = AccessToken.encode_and_sign(user, %{email: user.email, name: user.name})
        {user, jwt}
      end)

    {:ok,
     %{
       web_tenant: web_tenant,
       faecher_category: faecher_category,
       admin: admin,
       admin_jwt: admin_jwt,
       lehrer: lehrer,
       lehrer_jwt: lehrer_jwt,
       schueler: schueler,
       schueler_jwt: schueler_jwt,
       user: user,
       user_jwt: user_jwt
     }}
  end

  describe "categories query" do
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

    test "returns all categories for admin user", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "categories" => [
                   %{"category" => nil, "sortKey" => 0, "groups" => [], "title" => "Start"},
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 10,
                     "title" => "Podcast"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Fächer"},
                     "sortKey" => 10,
                     "title" => "Sport"
                   },
                   %{
                     "category" => nil,
                     "groups" => [%{"name" => "Verwaltung"}],
                     "sortKey" => 10,
                     "title" => "Profil"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Profil"},
                     "sortKey" => 20,
                     "title" => "Offene Kunst-AG"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Fächer"},
                     "sortKey" => 20,
                     "title" => "Kunst"
                   },
                   %{
                     "category" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "sortKey" => 20,
                     "title" => "GTA"
                   },
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 30,
                     "title" => "Schülerzeitung"
                   },
                   %{
                     "category" => %{"title" => "Fächer"},
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "sortKey" => 30,
                     "title" => "Sprache"
                   },
                   %{"groups" => [], "category" => nil, "sortKey" => 30, "title" => "Projekt"},
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 40,
                     "title" => "Oskar-Reime-Chor"
                   },
                   %{
                     "category" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "sortKey" => 40,
                     "title" => "Fächer"
                   },
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 50,
                     "title" => "Schüler-Radio"
                   },
                   %{
                     "category" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "sortKey" => 50,
                     "title" => "Material"
                   },
                   %{"groups" => [], "category" => nil, "sortKey" => 60, "title" => "Galerien"},
                   %{"category" => nil, "groups" => [], "sortKey" => 70, "title" => "Impressum"}
                 ]
               }
             }
    end

    test "returns all categories for lehrer if user is in lehrer_group", %{lehrer_jwt: lehrer_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "categories" => [
                   %{"category" => nil, "sortKey" => 0, "groups" => [], "title" => "Start"},
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 10,
                     "title" => "Podcast"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Fächer"},
                     "sortKey" => 10,
                     "title" => "Sport"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Profil"},
                     "sortKey" => 20,
                     "title" => "Offene Kunst-AG"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Fächer"},
                     "sortKey" => 20,
                     "title" => "Kunst"
                   },
                   %{
                     "category" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "sortKey" => 20,
                     "title" => "GTA"
                   },
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 30,
                     "title" => "Schülerzeitung"
                   },
                   %{
                     "category" => %{"title" => "Fächer"},
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "sortKey" => 30,
                     "title" => "Sprache"
                   },
                   %{"groups" => [], "category" => nil, "sortKey" => 30, "title" => "Projekt"},
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 40,
                     "title" => "Oskar-Reime-Chor"
                   },
                   %{
                     "category" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "sortKey" => 40,
                     "title" => "Fächer"
                   },
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 50,
                     "title" => "Schüler-Radio"
                   },
                   %{
                     "category" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "sortKey" => 50,
                     "title" => "Material"
                   },
                   %{"groups" => [], "category" => nil, "sortKey" => 60, "title" => "Galerien"},
                   %{"category" => nil, "groups" => [], "sortKey" => 70, "title" => "Impressum"}
                 ]
               }
             }
    end

    test "returns all categories for schueler if user is in schueler_group", %{
      schueler_jwt: schueler_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "categories" => [
                   %{"category" => nil, "sortKey" => 0, "groups" => [], "title" => "Start"},
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 10,
                     "title" => "Podcast"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Fächer"},
                     "sortKey" => 10,
                     "title" => "Sport"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Profil"},
                     "sortKey" => 20,
                     "title" => "Offene Kunst-AG"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Fächer"},
                     "sortKey" => 20,
                     "title" => "Kunst"
                   },
                   %{
                     "category" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "sortKey" => 20,
                     "title" => "GTA"
                   },
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 30,
                     "title" => "Schülerzeitung"
                   },
                   %{"groups" => [], "category" => nil, "sortKey" => 30, "title" => "Projekt"},
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 40,
                     "title" => "Oskar-Reime-Chor"
                   },
                   %{
                     "category" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "sortKey" => 40,
                     "title" => "Fächer"
                   },
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 50,
                     "title" => "Schüler-Radio"
                   },
                   %{"groups" => [], "category" => nil, "sortKey" => 60, "title" => "Galerien"},
                   %{"category" => nil, "groups" => [], "sortKey" => 70, "title" => "Impressum"}
                 ]
               }
             }
    end

    test "returns all categories with no groups if user has no groups", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "categories" => [
                   %{"category" => nil, "sortKey" => 0, "groups" => [], "title" => "Start"},
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 10,
                     "title" => "Podcast"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Fächer"},
                     "sortKey" => 10,
                     "title" => "Sport"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Profil"},
                     "sortKey" => 20,
                     "title" => "Offene Kunst-AG"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Fächer"},
                     "sortKey" => 20,
                     "title" => "Kunst"
                   },
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 30,
                     "title" => "Schülerzeitung"
                   },
                   %{"groups" => [], "category" => nil, "sortKey" => 30, "title" => "Projekt"},
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 40,
                     "title" => "Oskar-Reime-Chor"
                   },
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 50,
                     "title" => "Schüler-Radio"
                   },
                   %{"groups" => [], "category" => nil, "sortKey" => 60, "title" => "Galerien"},
                   %{"category" => nil, "groups" => [], "sortKey" => 70, "title" => "Impressum"}
                 ]
               }
             }
    end

    test "returns all categories with no groups if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "categories" => [
                   %{"category" => nil, "sortKey" => 0, "groups" => [], "title" => "Start"},
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 10,
                     "title" => "Podcast"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Fächer"},
                     "sortKey" => 10,
                     "title" => "Sport"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Profil"},
                     "sortKey" => 20,
                     "title" => "Offene Kunst-AG"
                   },
                   %{
                     "groups" => [],
                     "category" => %{"title" => "Fächer"},
                     "sortKey" => 20,
                     "title" => "Kunst"
                   },
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 30,
                     "title" => "Schülerzeitung"
                   },
                   %{"groups" => [], "category" => nil, "sortKey" => 30, "title" => "Projekt"},
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 40,
                     "title" => "Oskar-Reime-Chor"
                   },
                   %{
                     "category" => %{"title" => "Profil"},
                     "groups" => [],
                     "sortKey" => 50,
                     "title" => "Schüler-Radio"
                   },
                   %{"groups" => [], "category" => nil, "sortKey" => 60, "title" => "Galerien"},
                   %{"category" => nil, "groups" => [], "sortKey" => 70, "title" => "Impressum"}
                 ]
               }
             }
    end
  end

  describe "updateCategory mutation" do
    @query """
    mutation UpdateCategory($id: ID!, $category: CategoryInput!) {
      updateCategory(id: $id, category: $category) {
        title
      }
    }
    """

    test "upates title and sortKey", %{admin_jwt: admin_jwt, faecher_category: faecher_category} do
      category = %{
        title: "Neue Fächer"
      }

      res =
        build_conn()
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

    test "returns error if category does not exist", %{admin_jwt: admin_jwt} do
      category = %{
        title: "Neue Fächer"
      }

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: 0, category: category})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateCategory" => nil
               },
               "errors" => [
                 %{
                   "message" => "Kategorie mit der id 0 nicht gefunden.",
                   "path" => ["updateCategory"]
                 }
               ]
             } = res
    end

    test "returns error if user is not admin", %{
      user_jwt: user_jwt,
      faecher_category: faecher_category
    } do
      category = %{
        title: "Neue Fächer"
      }

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: faecher_category.id, category: category})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateCategory" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administrator dürfen Kategorien bearbeiten.",
                   "path" => ["updateCategory"]
                 }
               ]
             } = res
    end

    test "returns error if user is not logged in", %{faecher_category: faecher_category} do
      category = %{
        title: "Neue Fächer"
      }

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> post("/api", query: @query, variables: %{id: faecher_category.id, category: category})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateCategory" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administrator dürfen Kategorien bearbeiten.",
                   "path" => ["updateCategory"]
                 }
               ]
             } = res
    end
  end

  describe "createCategory mutation" do
    @query """
    mutation CreateCategory($category: CreateCategoryInput!) {
      createCategory(category: $category) {
        title
      }
    }
    """

    test "creates new category", %{admin_jwt: admin_jwt} do
      category = %{
        title: "Brandneu"
      }

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{category: category})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createCategory" => %{
                   "title" => "Brandneu"
                 }
               }
             }
    end

    test "returns error if user is not admin", %{user_jwt: user_jwt} do
      category = %{
        title: "Neue Fächer"
      }

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{category: category})
        |> json_response(200)

      assert %{
               "data" => %{
                 "createCategory" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administrator dürfen Kategorien erstellen.",
                   "path" => ["createCategory"]
                 }
               ]
             } = res
    end

    test "returns error if user is not logged in" do
      category = %{
        title: "Neue Fächer"
      }

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> post("/api", query: @query, variables: %{category: category})
        |> json_response(200)

      assert %{
               "data" => %{
                 "createCategory" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administrator dürfen Kategorien erstellen.",
                   "path" => ["createCategory"]
                 }
               ]
             } = res
    end
  end

  describe "deleteCategory mutation" do
    @query """
    mutation DeleteCategory($id: ID!) {
      deleteCategory(id: $id) {
        title
      }
    }
    """

    test "deletes faecher category with articles, make subcategories main categories", %{
      admin_jwt: admin_jwt,
      faecher_category: faecher_category,
      web_tenant: web_tenant
    } do
      article_ids =
        from(a in Article,
          where: a.category_id == ^faecher_category.id,
          select: a.id
        )
        |> Repo.all()

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: faecher_category.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteCategory" => %{
                   "title" => "Fächer"
                 }
               }
             }

      refetched_article_ids =
        from(a in Article, where: a.id in ^article_ids)
        |> Repo.all()

      assert refetched_article_ids == []

      refetched_main_categories =
        from(c in Category,
          where: is_nil(c.category_id) and c.tenant_id == ^web_tenant.id,
          order_by: [:sort_key, :title]
        )
        |> Repo.all()
        |> Enum.map(& &1.title)

      assert refetched_main_categories == [
               "Start",
               "Profil",
               "Sport",
               "GTA",
               "Kunst",
               "Projekt",
               "Sprache",
               "Material",
               "Galerien",
               "Impressum"
             ]
    end

    test "returns error if category does not exist", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert %{
               "data" => %{
                 "deleteCategory" => nil
               },
               "errors" => [
                 %{
                   "message" => "Kategorie mit der id 0 nicht gefunden.",
                   "path" => ["deleteCategory"]
                 }
               ]
             } = res
    end

    test "returns error if user is not admin", %{
      user_jwt: user_jwt,
      faecher_category: faecher_category
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: faecher_category.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "deleteCategory" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administrator dürfen Kategorien löschen.",
                   "path" => ["deleteCategory"]
                 }
               ]
             } = res
    end

    test "returns error if user is not logged in", %{faecher_category: faecher_category} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> post("/api", query: @query, variables: %{id: faecher_category.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "deleteCategory" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administrator dürfen Kategorien löschen.",
                   "path" => ["deleteCategory"]
                 }
               ]
             } = res
    end
  end
end
