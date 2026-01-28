defmodule LottaWeb.ArticleResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Ecto.Query

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.User
  alias Lotta.Storage.File
  alias Lotta.Content.Article
  alias Lotta.Tenants.Category

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Repo.put_prefix(@prefix)

    start_category =
      Repo.one!(from(c in Category, where: c.is_homepage == true), prefix: tenant.prefix)

    faecher_category =
      Repo.one!(from(c in Category, where: c.title == ^"Fächer"), prefix: tenant.prefix)

    projekt_category =
      Repo.one!(from(c in Category, where: c.title == ^"Projekt"), prefix: tenant.prefix)

    emails = [
      "alexis.rinaldoni@lotta.schule",
      "eike.wiewiorra@lotta.schule",
      "billy@lotta.schule",
      "maxi@lotta.schule"
    ]

    [{admin, admin_jwt}, {lehrer, lehrer_jwt}, {schueler, schueler_jwt}, {user, user_jwt}] =
      Enum.map(emails, fn email ->
        user = Repo.one!(from(u in User, where: u.email == ^email), prefix: tenant.prefix)

        {:ok, jwt, _} = AccessToken.encode_and_sign(user)

        {user, jwt}
      end)

    titles = ["Der Podcast zum WB 2", "Der Vorausscheid", "And the oskar goes to ...", "Draft2"]

    [kleinkunst_wb2, vorausscheid, oskar, draft] =
      Enum.map(titles, fn title ->
        Repo.one!(from(a in Article, where: a.title == ^title), prefix: tenant.prefix)
      end)

    {:ok,
     %{
       start_category: start_category,
       faecher_category: faecher_category,
       projekt_category: projekt_category,
       admin: admin,
       admin_jwt: admin_jwt,
       lehrer: lehrer,
       lehrer_jwt: lehrer_jwt,
       schueler: schueler,
       schueler_jwt: schueler_jwt,
       user: user,
       user_jwt: user_jwt,
       kleinkunst_wb2: kleinkunst_wb2,
       vorausscheid: vorausscheid,
       oskar: oskar,
       draft: draft,
       tenant: tenant
     }}
  end

  describe "article query" do
    @query """
    query article($id: ID!) {
      article(id: $id) {
        title
        preview
        tags
        readyToPublish
        isPinnedToTop
      }
    }
    """
    test "returns an article", %{oskar: oskar} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query, variables: %{id: oskar.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "article" => %{
                   "isPinnedToTop" => false,
                   "preview" => "Hallo hallo hallo",
                   "readyToPublish" => false,
                   "title" => "And the oskar goes to ...",
                   "tags" => nil
                 }
               }
             }
    end

    test "returns an lehrer-restricted article to admin", %{
      vorausscheid: vorausscheid,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "article" => %{
                   "isPinnedToTop" => false,
                   "preview" =>
                     "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.",
                   "readyToPublish" => false,
                   "title" => "Der Vorausscheid",
                   "tags" => ["KleinKunst 2018"]
                 }
               }
             }
    end

    test "returns a lehrer-restricted article to lehrer", %{
      vorausscheid: vorausscheid,
      lehrer_jwt: lehrer_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> get("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "article" => %{
                   "isPinnedToTop" => false,
                   "preview" =>
                     "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.",
                   "readyToPublish" => false,
                   "title" => "Der Vorausscheid",
                   "tags" => ["KleinKunst 2018"]
                 }
               }
             }
    end

    test "returns an error for lehrer-restricted article to schueler", %{
      vorausscheid: vorausscheid,
      schueler_jwt: schueler_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> get("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "article" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte dir diesen Beitrag anzusehen.",
                   "path" => ["article"]
                 }
               ]
             } = res
    end

    test "returns an error for lehrer-restricted article to user", %{
      vorausscheid: vorausscheid,
      user_jwt: user_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "article" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte dir diesen Beitrag anzusehen.",
                   "path" => ["article"]
                 }
               ]
             } = res
    end

    test "returns an error for lehrer-restricted article if user is not logged in", %{
      vorausscheid: vorausscheid
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "article" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte dir diesen Beitrag anzusehen.",
                   "path" => ["article"]
                 }
               ]
             } = res
    end

    test "returns an error if article id does not exist" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert %{
               "data" => %{
                 "article" => nil
               },
               "errors" => [
                 %{
                   "message" => "Beitrag nicht gefunden.",
                   "path" => ["article"]
                 }
               ]
             } = res
    end
  end

  describe "articles query" do
    # This is a test failing because first is not correctly recognized
    # as integer.
    # Seems this should be fixed in absinthe_plug, or by providing an
    # own parsing pipeline
    #
    # @query """
    # query getArticles($filter: ArticleFilter) {
    #   articles(filter: $filter) {
    #     title
    #     preview
    #     tags
    #     readyToPublish
    #     isPinnedToTop
    #   }
    # }
    # """

    # test "homepage: returns a list of articles, but limit to 2" do
    #   res =
    #     build_conn()
    #     |> get("/api", query: @query, variables: %{"filter" => %{"first" => 2}})
    #     |> json_response(200)

    #   assert res == %{
    #            "data" => %{
    #              "articles" => [
    #                %{
    #                  "isPinnedToTop" => false,
    #                  "readyToPublish" => false,
    #                  "tags" => nil,
    #                  "preview" => "Lorem ipsum dolor sit amet.",
    #                  "title" => "Beitrag Projekt 3"
    #                },
    #                %{
    #                  "isPinnedToTop" => false,
    #                  "readyToPublish" => false,
    #                  "tags" => nil,
    #                  "preview" => "Lorem ipsum dolor sit amet.",
    #                  "title" => "Beitrag Projekt 2"
    #                }
    #              ]
    #            }
    #          }
    # end

    @query """
    query getArticles($category_id: ID!) {
      articles(categoryID: $category_id) {
        title
        preview
        tags
        readyToPublish
        isPinnedToTop
      }
    }
    """
    test "homepage: returns a list of articles", %{start_category: start_category} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query, variables: %{"category_id" => start_category.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 3"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 2"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 1"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "preview" =>
                       "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
                     "title" => "„Nipple Jesus“- eine extreme Erfahrung"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "preview" =>
                       "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...",
                     "title" => "Landesfinale Volleyball WK IV"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "preview" => "Hallo hallo hallo",
                     "title" => "And the oskar goes to ..."
                   }
                 ]
               }
             }
    end

    test "homepage: returns a list of articles for user in lehrer group", %{
      lehrer_jwt: lehrer_jwt,
      start_category: start_category
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> get("/api", query: @query, variables: %{"category_id" => start_category.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 30 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 30 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 29 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 29 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 28 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 28 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 27 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 27 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 26 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 26 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 25 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 25 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 24 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 24 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 23 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 23 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 22 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 22 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 21 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 21 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 20 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 20 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 19 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 19 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 18 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 18 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 17 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 17 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 16 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 16 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 15 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 15 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 14 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 14 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 13 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 13 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 12 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 12 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 11 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 11 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 10 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 10 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 9 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 9 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 8 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 8 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 7 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 7 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 6 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 6 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 5 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 5 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 4 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 4 - nur für Lehrer",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 3",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 2",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 1",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
                     "readyToPublish" => false,
                     "title" => "„Nipple Jesus“- eine extreme Erfahrung",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.",
                     "readyToPublish" => false,
                     "title" => "Der Vorausscheid",
                     "tags" => ["KleinKunst 2018"]
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
                     "readyToPublish" => false,
                     "title" => "Der Podcast zum WB 2",
                     "tags" => ["KleinKunst 2018"]
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...",
                     "readyToPublish" => false,
                     "title" => "Landesfinale Volleyball WK IV",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Hallo hallo hallo",
                     "readyToPublish" => false,
                     "title" => "And the oskar goes to ...",
                     "tags" => nil
                   }
                 ]
               }
             }
    end

    test "homepage: returns a list of articles for user in schueler group", %{
      schueler_jwt: schueler_jwt,
      start_category: start_category
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> get("/api", query: @query, variables: %{"category_id" => start_category.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 30 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 29 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 28 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 27 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 26 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 25 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 24 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 23 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 22 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 21 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 20 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 19 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 18 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 17 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 16 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 15 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 14 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 13 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 12 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 11 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 10 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 9 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 8 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 7 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 6 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 5 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 4 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 3"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 2"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "Beitrag Projekt 1"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "preview" =>
                       "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
                     "title" => "„Nipple Jesus“- eine extreme Erfahrung"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "preview" =>
                       "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
                     "title" => "Der Podcast zum WB 2",
                     "tags" => ["KleinKunst 2018"]
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...",
                     "readyToPublish" => false,
                     "title" => "Landesfinale Volleyball WK IV",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Hallo hallo hallo",
                     "readyToPublish" => false,
                     "title" => "And the oskar goes to ...",
                     "tags" => nil
                   }
                 ]
               }
             }
    end

    test "category: returns a list of articles", %{projekt_category: projekt_category} do
      request = %{category_id: projekt_category.id}

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query, variables: request)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 3",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 2",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 1",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
                     "readyToPublish" => false,
                     "title" => "„Nipple Jesus“- eine extreme Erfahrung",
                     "tags" => nil
                   }
                 ]
               }
             }
    end

    @query """
    query articles($category_id: ID!) {
      articles(category_id: $category_id) {
        title
        preview
        tags
        readyToPublish
        isPinnedToTop
        groups {
          name
        }
      }
    }
    """
    test "category: returns a list of articles for user in lehrer group", %{
      lehrer_jwt: lehrer_jwt,
      projekt_category: projekt_category
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> get("/api", query: @query, variables: %{category_id: projekt_category.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 30 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 30 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 29 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 29 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 28 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 28 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 27 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 27 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 26 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 26 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 25 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 25 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 24 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 24 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 23 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 23 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 22 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 22 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 21 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 21 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 20 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 20 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 19 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 19 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 18 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 18 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 17 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 17 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 16 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 16 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 15 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 15 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 14 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 14 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 13 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 13 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 12 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 12 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 11 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 11 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 10 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 10 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 9 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 9 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 8 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 8 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 7 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 7 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 6 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 6 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 5 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 5 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [
                       %{"name" => "Lehrer"}
                     ],
                     "title" => "Beitrag Projekt 4 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 4 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [],
                     "title" => "Beitrag Projekt 3"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [],
                     "title" => "Beitrag Projekt 2"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [],
                     "title" => "Beitrag Projekt 1"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "groups" => [],
                     "preview" =>
                       "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
                     "title" => "„Nipple Jesus“- eine extreme Erfahrung"
                   }
                 ]
               }
             }
    end

    test "category: returns a list of articles for user in schueler group", %{
      schueler_jwt: schueler_jwt,
      projekt_category: projekt_category
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> get("/api", query: @query, variables: %{category_id: projekt_category.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 30 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 29 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 28 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 27 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 26 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 25 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 24 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 23 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 22 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 21 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 20 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 19 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 18 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 17 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 16 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 15 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 14 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 13 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 12 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 11 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 10 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 9 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 8 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 7 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 6 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 5 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 4 - nur für Schüler",
                     "tags" => nil
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "tags" => nil,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 3"
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 2",
                     "tags" => nil
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 1",
                     "tags" => nil
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
                     "readyToPublish" => false,
                     "title" => "„Nipple Jesus“- eine extreme Erfahrung",
                     "tags" => nil
                   }
                 ]
               }
             }
    end

    # This is a test failing because first is not correctly recognized
    # as integer.
    # Seems this should be fixed in absinthe_plug, or by providing an
    # own parsing pipeline
    #
    #
    # @query """
    # query articles($filter: ArticleFilter, $category_id: ID!) {
    #   articles(filter: $filter, category_id: $category_id) {
    #     title
    #     preview
    #     tags
    #     readyToPublish
    #     isPinnedToTop
    #   }
    # }
    # """

    # test "category: returns a list of articles, but limit to 2", %{
    #   projekt_category: projekt_category
    # } do
    #   res =
    #     build_conn()
    #     |> get("/api",
    #       query: @query,
    #       variables: %{"filter" => %{"first" => 2}, "category_id" => projekt_category.id}
    #     )
    #     |> json_response(200)

    #   assert res == %{
    #            "data" => %{
    #              "articles" => [
    #                %{
    #                  "isPinnedToTop" => false,
    #                  "readyToPublish" => false,
    #                  "tags" => nil,
    #                  "preview" => "Lorem ipsum dolor sit amet.",
    #                  "title" => "Beitrag Projekt 3"
    #                },
    #                %{
    #                  "isPinnedToTop" => false,
    #                  "preview" => "Lorem ipsum dolor sit amet.",
    #                  "readyToPublish" => false,
    #                  "tags" => nil,
    #                  "title" => "Beitrag Projekt 2"
    #                }
    #              ]
    #            }
    #          }
    # end
  end

  describe "unpublished articles query" do
    @query """
    query unpublishedArticles {
      unpublishedArticles {
        title
        preview
        tags
        readyToPublish
        isPinnedToTop
      }
    }
    """

    test "return a list of all unpublished articles if user is admin", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "unpublishedArticles" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Entwurf Artikel zu XYZ",
                     "readyToPublish" => true,
                     "title" => "Fertiger Artikel zum Konzert",
                     "tags" => nil
                   }
                 ]
               }
             }
    end

    test "return an error user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "unpublishedArticles" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["unpublishedArticles"]
                 }
               ]
             } = res
    end

    test "return an error user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "unpublishedArticles" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["unpublishedArticles"]
                 }
               ]
             } = res
    end
  end

  describe "articles with user files" do
    @query """
    query articlesWithUserFiles($userId: ID!) {
      articlesWithUserFiles(userId: $userId) {
        title
      }
    }
    """

    test "it should return an error when user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query, variables: %{userId: 1})
        |> json_response(200)

      assert %{
               "data" => %{"articlesWithUserFiles" => nil},
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["articlesWithUserFiles"]
                 }
               ]
             } = res
    end

    test "it should return an error when user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{userId: 1})
        |> json_response(200)

      assert %{
               "data" => %{"articlesWithUserFiles" => nil},
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["articlesWithUserFiles"]
                 }
               ]
             } = res
    end

    test "it should return an error if user is not available", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{userId: 0})
        |> json_response(200)

      assert %{
               "data" => %{"articlesWithUserFiles" => nil},
               "errors" => [
                 %{
                   "message" => "Nutzer mit der ID 0 nicht gefunden.",
                   "path" => ["articlesWithUserFiles"]
                 }
               ]
             } = res
    end

    test "it should return the user's relevant files in usage", %{
      lehrer: lehrer,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{userId: lehrer.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "articlesWithUserFiles" => [%{"title" => "And the oskar goes to ..."}]
               }
             } = res
    end
  end

  describe "ownArticles query" do
    @query """
    query ownArticles {
      ownArticles {
        title
        preview
        tags
        readyToPublish
        isPinnedToTop
      }
    }
    """

    test "return a list of all articles from the current user", %{lehrer_jwt: lehrer_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "ownArticles" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Hallo hallo hallo",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "And the oskar goes to ..."
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Entwurf Artikel zu XYZ",
                     "readyToPublish" => true,
                     "title" => "Fertiger Artikel zum Konzert",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Entwurf Artikel zu XYZ",
                     "readyToPublish" => false,
                     "title" => "Draft2",
                     "tags" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Entwurf Artikel zu I",
                     "readyToPublish" => false,
                     "title" => "Draft1",
                     "tags" => nil
                   }
                 ]
               }
             }
    end

    test "return an error user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "ownArticles" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["ownArticles"]
                 }
               ]
             } = res
    end
  end

  describe "get tags query" do
    @query """
    query tags {
      tags
    }
    """

    test "tags: returns a list of tags for a normal user" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "tags" => []
               }
             }
    end

    test "tags: returns a list of tags for an admin user", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "tags" => ["KleinKunst 2018"]
               }
             }
    end
  end

  describe "tags query" do
    @query """
    query articlesByTag($tag: String!) {
      articles: articlesByTag(tag: $tag) {
        title
        preview
        tags
        readyToPublish
        isPinnedToTop
      }
    }
    """

    test "returns all articles for lehrer_group", %{lehrer_jwt: lehrer_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> get("/api", query: @query, variables: %{tag: "KleinKunst 2018"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.",
                     "readyToPublish" => false,
                     "title" => "Der Vorausscheid",
                     "tags" => ["KleinKunst 2018"]
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
                     "readyToPublish" => false,
                     "title" => "Der Podcast zum WB 2",
                     "tags" => ["KleinKunst 2018"]
                   }
                 ]
               }
             }
    end

    test "returns all articles for schueler_group", %{schueler_jwt: schueler_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> get("/api", query: @query, variables: %{tag: "KleinKunst 2018"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
                     "readyToPublish" => false,
                     "title" => "Der Podcast zum WB 2",
                     "tags" => ["KleinKunst 2018"]
                   }
                 ]
               }
             }
    end

    test "returns all articles for not logged in user", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{tag: "KleinKunst 2018"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => []
               }
             }
    end
  end

  describe "articlesByUser query" do
    @query """
    query articlesByUser($id: ID!) {
      articles: articlesByUser(id: $id) {
        title
        preview
        tags
        readyToPublish
        isPinnedToTop
      }
    }
    """
    test "returns all articles of lehrer if user is lehrer", %{
      lehrer: lehrer,
      lehrer_jwt: lehrer_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> get("/api", query: @query, variables: %{id: lehrer.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Hallo hallo hallo",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "And the oskar goes to ..."
                   }
                 ]
               }
             }
    end

    test "returns all articles of lehrer if user is user", %{
      lehrer: lehrer,
      schueler_jwt: schueler_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> get("/api", query: @query, variables: %{id: lehrer.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Hallo hallo hallo",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "And the oskar goes to ..."
                   }
                 ]
               }
             }
    end

    test "returns all articles for lehrer if user is not logged in", %{
      lehrer: lehrer,
      user_jwt: user_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: lehrer.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Hallo hallo hallo",
                     "readyToPublish" => false,
                     "tags" => nil,
                     "title" => "And the oskar goes to ..."
                   }
                 ]
               }
             }
    end
  end

  describe "createArticle mutation" do
    @mutation """
    mutation createArticle($article: ArticleInput!) {
      createArticle(article: $article) {
        title
        preview
        tags
        readyToPublish
        users {
          name
        }
      }
    }
    """

    test "creates an article if user is logged in", %{lehrer_jwt: lehrer_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> post("/api",
          query: @mutation,
          variables: %{
            article: %{
              title: "Ein neuer Artikel",
              readyToPublish: true
            }
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createArticle" => %{
                   "preview" => nil,
                   "readyToPublish" => nil,
                   "title" => "Ein neuer Artikel",
                   "tags" => nil,
                   "users" => [%{"name" => "Eike Wiewiorra"}]
                 }
               }
             }
    end

    test "return an error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @mutation, variables: %{article: %{title: "ABC"}})
        |> json_response(200)

      assert %{
               "data" => %{
                 "createArticle" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["createArticle"]
                 }
               ]
             } = res
    end
  end

  describe "updateArticle mutation" do
    @query """
    mutation updateArticle($id: ID!, $article: ArticleInput!) {
      updateArticle(id: $id, article: $article) {
        title
        preview
        tags
        readyToPublish
        users {
          name
        }
      }
    }
    """

    test "updates an article if user is admin", %{admin_jwt: admin_jwt, draft: draft, tenant: t} do
      file =
        Repo.one!(
          from(f in File,
            where: f.filename == ^"ich_haesslich.jpg"
          ),
          prefix: t.prefix
        )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: draft.id,
            article: %{
              title: "ABC",
              content_modules: [
                %{
                  type: "IMAGE",
                  content: "{\"text\": \"bla\"}",
                  sort_key: 0,
                  configuration: "{}",
                  files: [%{id: file.id}]
                }
              ]
            }
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateArticle" => %{
                   "title" => "ABC",
                   "preview" => "Entwurf Artikel zu XYZ",
                   "readyToPublish" => false,
                   "tags" => nil,
                   "users" => [%{"name" => "Eike Wiewiorra"}]
                 }
               }
             }
    end

    test "updates an article if user is author", %{lehrer_jwt: lehrer_jwt, draft: draft} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> post("/api", query: @query, variables: %{id: draft.id, article: %{title: "ABC"}})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateArticle" => %{
                   "title" => "ABC",
                   "preview" => "Entwurf Artikel zu XYZ",
                   "readyToPublish" => false,
                   "tags" => nil,
                   "users" => [%{"name" => "Eike Wiewiorra"}]
                 }
               }
             }
    end

    test "returns an error if user is not author", %{schueler_jwt: schueler_jwt, draft: draft} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> post("/api", query: @query, variables: %{id: draft.id, article: %{title: "ABC"}})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateArticle" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du darfst diesen Beitrag nicht bearbeiten.",
                   "path" => ["updateArticle"]
                 }
               ]
             } = res
    end

    test "returns an error article does not exist", %{schueler_jwt: jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{jwt}")
        |> post("/api", query: @query, variables: %{id: 0, article: %{title: "ABC"}})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateArticle" => nil
               },
               "errors" => [
                 %{
                   "message" => "Beitrag mit der id 0 nicht gefunden.",
                   "path" => ["updateArticle"]
                 }
               ]
             } = res
    end

    test "returns an error if user is not logged in", %{draft: draft} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query, variables: %{id: draft.id, article: %{title: "ABC"}})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateArticle" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["updateArticle"]
                 }
               ]
             } = res
    end
  end

  describe "deleteArticle mutation" do
    @query """
    mutation deleteArticle($id: ID!) {
      deleteArticle(id: $id) {
        title
      }
    }
    """

    test "updates an article if user is admin", %{admin_jwt: admin_jwt, draft: draft} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: draft.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteArticle" => %{
                   "title" => "Draft2"
                 }
               }
             }
    end

    test "updates an article if user is author", %{lehrer_jwt: lehrer_jwt, draft: draft} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> post("/api", query: @query, variables: %{id: draft.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteArticle" => %{
                   "title" => "Draft2"
                 }
               }
             }
    end

    test "returns an error if user is not author", %{schueler_jwt: schueler_jwt, draft: draft} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> post("/api", query: @query, variables: %{id: draft.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "deleteArticle" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du darfst diesen Beitrag nicht bearbeiten.",
                   "path" => ["deleteArticle"]
                 }
               ]
             } = res
    end

    test "returns an error if article does not exist", %{schueler_jwt: jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{jwt}")
        |> post("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert %{
               "data" => %{
                 "deleteArticle" => nil
               },
               "errors" => [
                 %{
                   "message" => "Beitrag mit der id 0 nicht gefunden.",
                   "path" => ["deleteArticle"]
                 }
               ]
             } = res
    end

    test "returns an error if user is not logged in", %{draft: draft} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query, variables: %{id: draft.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "deleteArticle" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["deleteArticle"]
                 }
               ]
             } = res
    end
  end

  describe "toggleArticlePin mutation" do
    @query """
    mutation toggleArticlePin($id: ID!) {
      toggleArticlePin(id: $id) {
        title
        isPinnedToTop
      }
    }
    """

    test "updates an article if user is admin", %{
      admin_jwt: admin_jwt,
      vorausscheid: vorausscheid
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "toggleArticlePin" => %{
                   "title" => "Der Vorausscheid",
                   "isPinnedToTop" => true
                 }
               }
             }
    end

    test "returns an error if user is not admin", %{
      lehrer_jwt: lehrer_jwt,
      vorausscheid: vorausscheid
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> post("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "toggleArticlePin" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["toggleArticlePin"]
                 }
               ]
             } = res
    end

    test "returns an error if article does not exist", %{admin_jwt: jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{jwt}")
        |> post("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert %{
               "data" => %{
                 "toggleArticlePin" => nil
               },
               "errors" => [
                 %{
                   "message" => "Beitrag mit der id 0 nicht gefunden.",
                   "path" => ["toggleArticlePin"]
                 }
               ]
             } = res
    end

    test "returns an error if user is not logged in", %{vorausscheid: vorausscheid} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "toggleArticlePin" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["toggleArticlePin"]
                 }
               ]
             } = res
    end
  end
end
