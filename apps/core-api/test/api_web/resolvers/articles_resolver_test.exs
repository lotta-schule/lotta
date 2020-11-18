defmodule ApiWeb.ArticleResolverTest do
  @moduledoc """
    Test Module for ArticleResolver
  """

  use ApiWeb.ConnCase, async: true

  alias ApiWeb.Auth.AccessToken
  alias Api.Repo
  alias Api.Accounts.{File, User}
  alias Api.Content.Article
  alias Api.System.Category

  setup do
    Repo.Seeder.seed()

    faecher_category = Repo.get_by!(Category, title: "Fächer")
    projekt_category = Repo.get_by!(Category, title: "Projekt")

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

    titles = ["Der Podcast zum WB 2", "Der Vorausscheid", "And the oskar goes to ...", "Draft2"]

    [kleinkunst_wb2, vorausscheid, oskar, draft] =
      Enum.map(titles, fn title -> Repo.get_by!(Article, title: title) end)

    {:ok,
     %{
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
       draft: draft
     }}
  end

  describe "article query" do
    @query """
    query article($id: ID!) {
      article(id: $id) {
        title
        preview
        topic
        readyToPublish
        isPinnedToTop
      }
    }
    """
    test "returns an article", %{oskar: oskar} do
      res =
        build_conn()
        |> get("/api", query: @query, variables: %{id: oskar.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "article" => %{
                   "isPinnedToTop" => false,
                   "preview" => "Hallo hallo hallo",
                   "readyToPublish" => false,
                   "title" => "And the oskar goes to ...",
                   "topic" => nil
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
                   "topic" => "KleinKunst 2018"
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
                   "topic" => "KleinKunst 2018"
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
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> get("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "article" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du hast keine Rechte diesen Beitrag anzusehen.",
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
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "article" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du hast keine Rechte diesen Beitrag anzusehen.",
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
        |> get("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "article" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du hast keine Rechte diesen Beitrag anzusehen.",
                   "path" => ["article"]
                 }
               ]
             } = res
    end
  end

  describe "articles query" do
    @query """
    query articles {
      articles {
        title
        preview
        topic
        readyToPublish
        isPinnedToTop
      }
    }
    """

    test "homepage: returns a list of articles" do
      res =
        build_conn()
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 3"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 2"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 1"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
                     "preview" =>
                       "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
                     "title" => "„Nipple Jesus“- eine extreme Erfahrung"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
                     "preview" =>
                       "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...",
                     "title" => "Landesfinale Volleyball WK IV"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
                     "preview" => "Hallo hallo hallo",
                     "title" => "And the oskar goes to ..."
                   }
                 ]
               }
             }
    end

    @query """
    query articles {
      articles {
        title
        preview
        topic
        readyToPublish
        isPinnedToTop
        groups {
          name
        }
      }
    }
    """

    test "homepage: returns a list of articles for user in lehrer group", %{
      lehrer_jwt: lehrer_jwt
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 30 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 30 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 29 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 29 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 28 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 28 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 27 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 27 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 26 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 26 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 25 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 25 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 24 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 24 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 23 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 23 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 22 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 22 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 21 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 21 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 20 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 20 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 19 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 19 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 18 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 18 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 17 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 17 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 16 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 16 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 15 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 15 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 14 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 14 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 13 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 13 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 12 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 12 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 11 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 11 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 10 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 10 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 9 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 9 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 8 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 8 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 7 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 7 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 6 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 6 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 5 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 5 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 4 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 4 - nur für Lehrer",
                     "topic" => nil
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 3",
                     "topic" => nil
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 2",
                     "topic" => nil
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 1",
                     "topic" => nil
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
                     "readyToPublish" => false,
                     "title" => "„Nipple Jesus“- eine extreme Erfahrung",
                     "topic" => nil
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.",
                     "readyToPublish" => false,
                     "title" => "Der Vorausscheid",
                     "topic" => "KleinKunst 2018"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
                     "readyToPublish" => false,
                     "title" => "Der Podcast zum WB 2",
                     "topic" => "KleinKunst 2018"
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...",
                     "readyToPublish" => false,
                     "title" => "Landesfinale Volleyball WK IV",
                     "topic" => nil
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" => "Hallo hallo hallo",
                     "readyToPublish" => false,
                     "title" => "And the oskar goes to ...",
                     "topic" => nil
                   }
                 ]
               }
             }
    end

    test "homepage: returns a list of articles for user in schueler group", %{
      schueler_jwt: schueler_jwt
    } do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 30 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 29 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 28 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 27 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 26 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 25 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 24 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 23 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 22 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 21 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 20 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 19 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 18 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 17 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 16 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 15 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 14 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 13 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 12 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 11 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 10 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 9 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 8 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 7 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 6 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 5 - nur für Schüler"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "title" => "Beitrag Projekt 4 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [],
                     "title" => "Beitrag Projekt 3"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [],
                     "title" => "Beitrag Projekt 2"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [],
                     "title" => "Beitrag Projekt 1"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [],
                     "preview" =>
                       "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
                     "title" => "„Nipple Jesus“- eine extreme Erfahrung"
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "preview" =>
                       "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
                     "title" => "Der Podcast zum WB 2",
                     "topic" => "KleinKunst 2018"
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...",
                     "readyToPublish" => false,
                     "title" => "Landesfinale Volleyball WK IV",
                     "topic" => nil
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" => "Hallo hallo hallo",
                     "readyToPublish" => false,
                     "title" => "And the oskar goes to ...",
                     "topic" => nil
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
    # @query """
    # query getArticles($filter: ArticleFilter) {
    #   articles(filter: $filter) {
    #     title
    #     preview
    #     topic
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
    #                  "topic" => nil,
    #                  "preview" => "Lorem ipsum dolor sit amet.",
    #                  "title" => "Beitrag Projekt 3"
    #                },
    #                %{
    #                  "isPinnedToTop" => false,
    #                  "readyToPublish" => false,
    #                  "topic" => nil,
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
        topic
        readyToPublish
        isPinnedToTop
      }
    }
    """

    test "category: returns a list of articles", %{projekt_category: projekt_category} do
      request = %{category_id: projekt_category.id}

      res =
        build_conn()
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
                     "topic" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 2",
                     "topic" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 1",
                     "topic" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
                     "readyToPublish" => false,
                     "title" => "„Nipple Jesus“- eine extreme Erfahrung",
                     "topic" => nil
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
        topic
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
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> get("/api", query: @query, variables: %{category_id: projekt_category.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 30 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 30 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 29 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 29 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 28 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 28 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 27 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 27 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 26 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 26 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 25 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 25 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 24 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 24 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 23 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 23 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 22 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 22 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 21 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 21 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 20 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 20 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 19 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 19 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 18 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 18 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 17 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 17 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 16 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 16 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 15 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 15 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 14 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 14 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 13 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 13 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 12 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 12 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 11 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 11 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 10 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 10 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 9 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 9 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 8 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 8 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 7 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 7 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 6 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 6 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 5 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 5 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "title" => "Beitrag Projekt 4 - nur für Schüler"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Beitrag Projekt 4 - nur für Lehrer"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [],
                     "title" => "Beitrag Projekt 3"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [],
                     "title" => "Beitrag Projekt 2"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "topic" => nil,
                     "groups" => [],
                     "title" => "Beitrag Projekt 1"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
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
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> get("/api", query: @query, variables: %{category_id: projekt_category.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "articles" => [
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 30 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 29 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 28 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 27 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 26 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 25 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 24 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 23 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 22 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 21 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 20 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 19 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 18 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 17 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 16 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 15 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 14 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 13 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 12 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 11 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 10 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 9 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 8 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 7 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 6 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 5 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [
                       %{"name" => "Verwaltung"},
                       %{"name" => "Lehrer"},
                       %{"name" => "Schüler"}
                     ],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 4 - nur für Schüler",
                     "topic" => nil
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "readyToPublish" => false,
                     "topic" => nil,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "title" => "Beitrag Projekt 3"
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 2",
                     "topic" => nil
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" => "Lorem ipsum dolor sit amet.",
                     "readyToPublish" => false,
                     "title" => "Beitrag Projekt 1",
                     "topic" => nil
                   },
                   %{
                     "groups" => [],
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.",
                     "readyToPublish" => false,
                     "title" => "„Nipple Jesus“- eine extreme Erfahrung",
                     "topic" => nil
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
    #     topic
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
    #                  "topic" => nil,
    #                  "preview" => "Lorem ipsum dolor sit amet.",
    #                  "title" => "Beitrag Projekt 3"
    #                },
    #                %{
    #                  "isPinnedToTop" => false,
    #                  "preview" => "Lorem ipsum dolor sit amet.",
    #                  "readyToPublish" => false,
    #                  "topic" => nil,
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
        topic
        readyToPublish
        isPinnedToTop
      }
    }
    """

    test "return a list of all unpublished articles if user is admin", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
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
                     "topic" => nil
                   }
                 ]
               }
             }
    end

    test "return an error user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "unpublishedArticles" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administratoren dürfen unveröffentlichte Beiträge abrufen.",
                   "path" => ["unpublishedArticles"]
                 }
               ]
             } = res
    end

    test "return an error user is not logged in" do
      res =
        build_conn()
        |> get("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "unpublishedArticles" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administratoren dürfen unveröffentlichte Beiträge abrufen.",
                   "path" => ["unpublishedArticles"]
                 }
               ]
             } = res
    end
  end

  describe "ownArticles query" do
    @query """
    query ownArticles {
      ownArticles {
        title
        preview
        topic
        readyToPublish
        isPinnedToTop
      }
    }
    """

    test "return a list of all articles from the current user", %{lehrer_jwt: lehrer_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "ownArticles" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Entwurf Artikel zu I",
                     "readyToPublish" => false,
                     "title" => "Draft1",
                     "topic" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Entwurf Artikel zu XYZ",
                     "readyToPublish" => false,
                     "title" => "Draft2",
                     "topic" => nil
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" => "Entwurf Artikel zu XYZ",
                     "readyToPublish" => true,
                     "title" => "Fertiger Artikel zum Konzert",
                     "topic" => nil
                   }
                 ]
               }
             }
    end

    test "return an error user is not logged in" do
      res =
        build_conn()
        |> get("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "ownArticles" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur angemeldete Nutzer können eigene Beiträge abrufen.",
                   "path" => ["ownArticles"]
                 }
               ]
             } = res
    end
  end

  describe "get topics query" do
    @query """
    query topics {
      topics
    }
    """

    test "topics: returns a list of topics for a normal user" do
      res =
        build_conn()
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "topics" => []
               }
             }
    end

    test "topics: returns a list of topics for an admin user", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "topics" => ["KleinKunst 2018"]
               }
             }
    end
  end

  describe "topic query" do
    @query """
    query topic($topic: String!) {
      topic(topic: $topic) {
        title
        preview
        topic
        readyToPublish
        isPinnedToTop
      }
    }
    """

    test "returns all articles for lehrer_group", %{lehrer_jwt: lehrer_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> get("/api", query: @query, variables: %{topic: "KleinKunst 2018"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "topic" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.",
                     "readyToPublish" => false,
                     "title" => "Der Vorausscheid",
                     "topic" => "KleinKunst 2018"
                   },
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
                     "readyToPublish" => false,
                     "title" => "Der Podcast zum WB 2",
                     "topic" => "KleinKunst 2018"
                   }
                 ]
               }
             }
    end

    test "returns all articles for schueler_group", %{schueler_jwt: schueler_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> get("/api", query: @query, variables: %{topic: "KleinKunst 2018"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "topic" => [
                   %{
                     "isPinnedToTop" => false,
                     "preview" =>
                       "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
                     "readyToPublish" => false,
                     "title" => "Der Podcast zum WB 2",
                     "topic" => "KleinKunst 2018"
                   }
                 ]
               }
             }
    end

    test "returns all articles for not logged in user", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{topic: "KleinKunst 2018"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "topic" => []
               }
             }
    end
  end

  describe "createArticle mutation" do
    @query """
    mutation createArticle($article: ArticleInput!) {
      createArticle(article: $article) {
        title
        preview
        topic
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
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> post("/api",
          query: @query,
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
                   "topic" => nil,
                   "users" => [%{"name" => "Eike Wiewiorra"}]
                 }
               }
             }
    end

    test "return an error if user is not logged in" do
      res =
        build_conn()
        |> post("/api", query: @query, variables: %{article: %{title: "ABC"}})
        |> json_response(200)

      assert %{
               "data" => %{
                 "createArticle" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur angemeldete Nutzer können Beiträge erstellen.",
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
        topic
        readyToPublish
        users {
          name
        }
      }
    }
    """

    test "updates an article if user is admin", %{admin_jwt: admin_jwt, draft: draft} do
      file1 = Repo.get_by!(File, filename: "ich_schoen.jpg")
      file2 = Repo.get_by!(File, filename: "ich_haesslich.jpg")

      draft
      |> Article.changeset(%{
        content_modules: [
          %{
            type: "IMAGE",
            content: "{\"text\": \"\"}",
            sort_key: 0,
            configuration: "{}",
            files: [%{id: file1.id}]
          }
        ]
      })

      res =
        build_conn()
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
                  files: [%{id: file2.id}]
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
                   "topic" => nil,
                   "users" => [%{"name" => "Eike Wiewiorra"}]
                 }
               }
             }
    end

    test "updates an article if user is author", %{lehrer_jwt: lehrer_jwt, draft: draft} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> post("/api", query: @query, variables: %{id: draft.id, article: %{title: "ABC"}})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateArticle" => %{
                   "title" => "ABC",
                   "preview" => "Entwurf Artikel zu XYZ",
                   "readyToPublish" => false,
                   "topic" => nil,
                   "users" => [%{"name" => "Eike Wiewiorra"}]
                 }
               }
             }
    end

    test "returns an error if user is not author", %{schueler_jwt: schueler_jwt, draft: draft} do
      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> post("/api", query: @query, variables: %{id: draft.id, article: %{title: "ABC"}})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateArticle" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administratoren oder Autoren dürfen Beiträge bearbeiten.",
                   "path" => ["updateArticle"]
                 }
               ]
             } = res
    end

    test "returns an error if user is not logged in", %{draft: draft} do
      res =
        build_conn()
        |> post("/api", query: @query, variables: %{id: draft.id, article: %{title: "ABC"}})
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateArticle" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um Beiträge zu bearbeiten.",
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
        |> put_req_header("authorization", "Bearer #{schueler_jwt}")
        |> post("/api", query: @query, variables: %{id: draft.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "deleteArticle" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administratoren oder Autoren dürfen Beiträge löschen.",
                   "path" => ["deleteArticle"]
                 }
               ]
             } = res
    end

    test "returns an error if user is not logged in", %{draft: draft} do
      res =
        build_conn()
        |> post("/api", query: @query, variables: %{id: draft.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "deleteArticle" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um Beiträge zu löschen.",
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
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> post("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "toggleArticlePin" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administratoren dürfen Beiträge anpinnen.",
                   "path" => ["toggleArticlePin"]
                 }
               ]
             } = res
    end

    test "returns an error if user is not logged in", %{vorausscheid: vorausscheid} do
      res =
        build_conn()
        |> post("/api", query: @query, variables: %{id: vorausscheid.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "toggleArticlePin" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administratoren dürfen Beiträge anpinnen.",
                   "path" => ["toggleArticlePin"]
                 }
               ]
             } = res
    end
  end
end
