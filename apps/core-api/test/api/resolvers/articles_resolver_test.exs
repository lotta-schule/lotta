defmodule Api.ArticleResolverTest do
  use ApiWeb.ConnCase
  
  setup do
    Api.Repo.Seeder.seed()

    web_tenant = Api.Tenants.get_tenant_by_slug!("web")
    faecher_category = Api.Repo.get_by!(Api.Tenants.Category, title: "Fächer")
    projekt_category = Api.Repo.get_by!(Api.Tenants.Category, title: "Projekt")
    emails = [
      "alexis.rinaldoni@einsa.net", "eike.wiewiorra@einsa.net", "billy@einsa.net", "maxi@einsa.net"
    ]
    [{admin, admin_jwt}, {lehrer, lehrer_jwt}, {schueler, schueler_jwt}, {user, user_jwt}] = Enum.map(emails, fn email ->
      user = Api.Repo.get_by!(Api.Accounts.User, [email: email])
      {:ok, jwt, _} = Api.Guardian.encode_and_sign(user, %{ email: user.email, name: user.name })
      {user, jwt}
    end)
    titles = ["Der Podcast zum WB 2", "Der Vorausscheid", "And the oskar goes to ..."]
    [kleinkunst_wb2, vorausscheid, oskar] = Enum.map(titles, fn title -> Api.Repo.get_by!(Api.Content.Article, title: title) end)

    {:ok, %{
      web_tenant: web_tenant,
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
      oskar: oskar
    }}
  end

  @query """
  query article ($id: ID!) {
    article(id: $id) {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "article field should return an article", %{oskar: oskar} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> get("/api", query: @query, variables: %{id: oskar.id})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "article" => %{
          "is_pinned_to_top" => false,
          "preview" => "Hallo hallo hallo",
          "ready_to_publish" => false,
          "title" => "And the oskar goes to ...",
          "topic" => nil
        }
      }
    }
  end

  @query """
  query article ($id: ID!) {
    article(id: $id) {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "article field should return an lehrer-restricted article to admin", %{vorausscheid: vorausscheid, admin_jwt: admin_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{admin_jwt}")
    |> get("/api", query: @query, variables: %{id: vorausscheid.id})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "article" => %{
          "is_pinned_to_top" => false,
          "preview" => "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.",
          "ready_to_publish" => false,
          "title" => "Der Vorausscheid",
          "topic" => "KleinKunst 2018"
        }
      }
    }
  end

  @query """
  query article ($id: ID!) {
    article(id: $id) {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "article field should return a lehrer-restricted article to lehrer", %{vorausscheid: vorausscheid, lehrer_jwt: lehrer_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
    |> get("/api", query: @query, variables: %{id: vorausscheid.id})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "article" => %{
          "is_pinned_to_top" => false,
          "preview" => "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.",
          "ready_to_publish" => false,
          "title" => "Der Vorausscheid",
          "topic" => "KleinKunst 2018"
        }
      }
    }
  end
  
  @query """
  query article ($id: ID!) {
    article(id: $id) {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "article field should return an error for lehrer-restricted article to schueler", %{vorausscheid: vorausscheid, schueler_jwt: schueler_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{schueler_jwt}")
    |> get("/api", query: @query, variables: %{id: vorausscheid.id})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "article" => nil
      },
      "errors" => [
        %{
          "locations" => [%{"column" => 0, "line" => 2}],
          "message" => "Du hast keine Rechte diesen Beitrag anzusehen.",
          "path" => ["article"]
        }
      ]
    }
  end
  
  @query """
  query article ($id: ID!) {
    article(id: $id) {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "article field should return an error for lehrer-restricted article to user", %{vorausscheid: vorausscheid, user_jwt: user_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{user_jwt}")
    |> get("/api", query: @query, variables: %{id: vorausscheid.id})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "article" => nil
      },
      "errors" => [
        %{
          "locations" => [%{"column" => 0, "line" => 2}],
          "message" => "Du hast keine Rechte diesen Beitrag anzusehen.",
          "path" => ["article"]
        }
      ]
    }
  end
  
  @query """
  query article ($id: ID!) {
    article(id: $id) {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "article field should return an error for lehrer-restricted article if user is not logged in", %{vorausscheid: vorausscheid} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> get("/api", query: @query, variables: %{id: vorausscheid.id})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "article" => nil
      },
      "errors" => [
        %{
          "locations" => [%{"column" => 0, "line" => 2}],
          "message" => "Du hast keine Rechte diesen Beitrag anzusehen.",
          "path" => ["article"]
        }
      ]
    }
  end


  @query """
  query articles {
    articles {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "articles should return a list of articles for the homepage" do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "articles" => [
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "preview" => "Lorem ipsum dolor sit amet.", "title" => "Beitrag Projekt 3"},
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "preview" => "Lorem ipsum dolor sit amet.", "title" => "Beitrag Projekt 2"},
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "preview" => "Lorem ipsum dolor sit amet.", "title" => "Beitrag Projekt 1"},
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "preview" => "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.", "title" => "„Nipple Jesus“- eine extreme Erfahrung"},
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "preview" => "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...", "title" => "Landesfinale Volleyball WK IV"},
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "preview" => "Hallo hallo hallo", "title" => "And the oskar goes to ..."}
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
      ready_to_publish
      is_pinned_to_top
      group {
        name
      }
    }
  }
  """
  test "articles should return a list of articles for the homepage for user in lehrer group", %{lehrer_jwt: lehrer_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "articles" => [
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 30 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 30 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 29 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 29 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 28 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 28 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 27 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 27 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 26 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 26 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 25 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 25 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 24 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 24 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 23 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 23 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 22 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 22 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 21 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 21 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 20 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 20 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 19 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 19 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 18 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 18 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 17 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 17 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 16 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 16 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 15 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 15 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 14 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 14 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 13 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 13 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 12 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 12 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 11 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 11 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 10 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 10 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 9 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 9 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 8 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 8 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 7 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 7 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 6 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 6 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 5 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 5 - nur für Lehrer", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 4 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 4 - nur für Lehrer", "topic" => nil},
          %{"group" => nil, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 3", "topic" => nil},
          %{"group" => nil, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 2", "topic" => nil},
          %{"group" => nil, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 1", "topic" => nil},
          %{"group" => nil, "is_pinned_to_top" => false, "preview" => "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.", "ready_to_publish" => false, "title" => "„Nipple Jesus“- eine extreme Erfahrung", "topic" => nil},
          %{"group" => %{"name" => "Lehrer"}, "is_pinned_to_top" => false, "preview" => "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.", "ready_to_publish" => false, "title" => "Der Vorausscheid", "topic" => "KleinKunst 2018"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.", "ready_to_publish" => false, "title" => "Der Podcast zum WB 2", "topic" => "KleinKunst 2018"},
          %{"group" => nil, "is_pinned_to_top" => false, "preview" => "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...", "ready_to_publish" => false, "title" => "Landesfinale Volleyball WK IV", "topic" => nil},
          %{"group" => nil, "is_pinned_to_top" => false, "preview" => "Hallo hallo hallo", "ready_to_publish" => false, "title" => "And the oskar goes to ...", "topic" => nil}
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
      ready_to_publish
      is_pinned_to_top
      group {
        name
      }
    }
  }
  """
  test "articles should return a list of articles for the homepage for user in schueler group", %{schueler_jwt: schueler_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{schueler_jwt}")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "articles" => [
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 30 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 29 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "preview" => "Lorem ipsum dolor sit amet.", "title" => "Beitrag Projekt 28 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "preview" => "Lorem ipsum dolor sit amet.", "title" => "Beitrag Projekt 27 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "preview" => "Lorem ipsum dolor sit amet.", "title" => "Beitrag Projekt 26 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 25 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 24 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 23 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 22 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 21 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 20 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 19 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 18 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 17 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 16 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 15 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 14 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 13 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 12 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 11 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 10 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 9 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 8 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 7 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 6 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 5 - nur für Schüler"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 4 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => nil, "title" => "Beitrag Projekt 3"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => nil, "title" => "Beitrag Projekt 2"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => nil, "title" => "Beitrag Projekt 1"},
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "group" => nil, "preview" => "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.", "title" => "„Nipple Jesus“- eine extreme Erfahrung"},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "ready_to_publish" => false, "preview" => "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.", "title" => "Der Podcast zum WB 2", "topic" => "KleinKunst 2018"},
          %{"group" => nil, "is_pinned_to_top" => false, "preview" => "Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale \"Jugend trainiert für Europa\" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...", "ready_to_publish" => false, "title" => "Landesfinale Volleyball WK IV", "topic" => nil},
          %{"group" => nil, "is_pinned_to_top" => false, "preview" => "Hallo hallo hallo", "ready_to_publish" => false, "title" => "And the oskar goes to ...", "topic" => nil}
        ]
      }
    }
  end

  @query """
  query articles($filter: ArticleFilter) {
    articles(filter: $filter) {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "articles should return a list of articles for the homepage, but limit to 2" do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> get("/api", query: @query, variables: %{filter: %{first: 2}})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "articles" => [
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "preview" => "Lorem ipsum dolor sit amet.", "title" => "Beitrag Projekt 3"},
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "preview" => "Lorem ipsum dolor sit amet.", "title" => "Beitrag Projekt 2"},
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
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "articles should return a list of articles for the projekt category", %{projekt_category: projekt_category} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> get("/api", query: @query, variables: %{category_id: projekt_category.id})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "articles" => [
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 3", "topic" => nil},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 2", "topic" => nil},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 1", "topic" => nil},
          %{"is_pinned_to_top" => false, "preview" => "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.", "ready_to_publish" => false, "title" => "„Nipple Jesus“- eine extreme Erfahrung", "topic" => nil}
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
      ready_to_publish
      is_pinned_to_top
      group {
        name
      }
    }
  }
  """
  test "articles should return a list of articles for the projekt category for user in lehrer group", %{lehrer_jwt: lehrer_jwt, projekt_category: projekt_category} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
    |> get("/api", query: @query, variables: %{category_id: projekt_category.id})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "articles" => [
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "preview" => "Lorem ipsum dolor sit amet.", "title" => "Beitrag Projekt 30 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 30 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 29 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 29 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 28 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 28 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 27 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 27 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 26 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 26 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 25 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 25 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 24 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 24 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 23 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 23 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 22 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 22 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 21 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 21 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 20 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 20 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 19 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 19 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 18 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 18 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 17 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 17 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 16 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 16 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 15 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 15 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 14 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 14 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 13 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 13 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 12 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 12 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 11 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 11 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 10 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 10 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 9 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 9 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 8 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 8 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 7 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 7 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 6 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 6 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 5 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 5 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Schüler"}, "title" => "Beitrag Projekt 4 - nur für Schüler"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => %{"name" => "Lehrer"}, "title" => "Beitrag Projekt 4 - nur für Lehrer"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => nil, "title" => "Beitrag Projekt 3"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => nil, "title" => "Beitrag Projekt 2"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "group" => nil, "title" => "Beitrag Projekt 1"},
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "group" => nil, "preview" => "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.", "title" => "„Nipple Jesus“- eine extreme Erfahrung"}
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
      ready_to_publish
      is_pinned_to_top
      group {
        name
      }
    }
  }
  """
  test "articles should return a list of articles for the projekt category for user in schueler group", %{schueler_jwt: schueler_jwt, projekt_category: projekt_category} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{schueler_jwt}")
    |> get("/api", query: @query, variables: %{category_id: projekt_category.id})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "articles" => [
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 30 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 29 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 28 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 27 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 26 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 25 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 24 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 23 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 22 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 21 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 20 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 19 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 18 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 17 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 16 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 15 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 14 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 13 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 12 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 11 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 10 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 9 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 8 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 7 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 6 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 5 - nur für Schüler", "topic" => nil},
          %{"group" => %{"name" => "Schüler"}, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 4 - nur für Schüler", "topic" => nil},
          %{"group" => nil, "is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "preview" => "Lorem ipsum dolor sit amet.", "title" => "Beitrag Projekt 3"},
          %{"group" => nil, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 2", "topic" => nil},
          %{"group" => nil, "is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "title" => "Beitrag Projekt 1", "topic" => nil},
          %{"group" => nil, "is_pinned_to_top" => false, "preview" => "Das Theaterstück „Nipple Jesus“, welches am 08.02.2019 im Museum der Bildenden Künste aufgeführt wurde, hat bei mir noch lange nach der Aufführung große Aufmerksamkeit hinterlassen.", "ready_to_publish" => false, "title" => "„Nipple Jesus“- eine extreme Erfahrung", "topic" => nil}
        ]
      }
    }
  end

  @query """
  query articles($filter: ArticleFilter, $category_id: ID!) {
    articles(filter: $filter, category_id: $category_id) {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "articles should return a list of articles for the projekt category, but limit to 2", %{projekt_category: projekt_category} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> get("/api", query: @query, variables: %{filter: %{first: 2}, category_id: projekt_category.id})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "articles" => [
          %{"is_pinned_to_top" => false, "ready_to_publish" => false, "topic" => nil, "preview" => "Lorem ipsum dolor sit amet.", "title" => "Beitrag Projekt 3"},
          %{"is_pinned_to_top" => false, "preview" => "Lorem ipsum dolor sit amet.", "ready_to_publish" => false, "topic" => nil, "title" => "Beitrag Projekt 2"}
        ]
      }
    }
  end


  @query """
  query unpublishedArticles {
    unpublishedArticles {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "unpublishedArticles should return a list of all unpublished articles if user is admin", %{admin_jwt: admin_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{admin_jwt}")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "unpublishedArticles" => [
          %{"is_pinned_to_top" => false, "preview" => "Entwurf Artikel zu XYZ", "ready_to_publish" => true, "title" => "Fertiger Artikel zum Konzert", "topic" => nil}
        ]
      }
    }
  end

  @query """
  query unpublishedArticles {
    unpublishedArticles {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "unpublishedArticles should return an error user is not admin", %{user_jwt: user_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{user_jwt}")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "unpublishedArticles" => nil
      },
      "errors" => [%{
        "locations" => [%{"column" => 0, "line" => 2}],
        "message" => "Nur Administratoren dürfen unveröffentlichte Beiträge abrufen.",
        "path" => ["unpublishedArticles"]
      }]
    }
  end

  @query """
  query unpublishedArticles {
    unpublishedArticles {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "unpublishedArticles should return an error user is not logged in" do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "unpublishedArticles" => nil
      },
      "errors" => [%{
        "locations" => [%{"column" => 0, "line" => 2}],
        "message" => "Nur Administratoren dürfen unveröffentlichte Beiträge abrufen.",
        "path" => ["unpublishedArticles"]
      }]
    }
  end


  @query """
  query ownArticles {
    ownArticles {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "ownArticles should return a list of all articles from the current user", %{lehrer_jwt: lehrer_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "ownArticles" => [
          %{"is_pinned_to_top" => false, "preview" => "Entwurf Artikel zu I", "ready_to_publish" => false, "title" => "Draft1", "topic" => nil},
          %{"is_pinned_to_top" => false, "preview" => "Entwurf Artikel zu XYZ", "ready_to_publish" => false, "title" => "Draft2", "topic" => nil},
          %{"is_pinned_to_top" => false, "preview" => "Entwurf Artikel zu XYZ", "ready_to_publish" => true, "title" => "Fertiger Artikel zum Konzert", "topic" => nil}
        ]
      }
    }
  end

  @query """
  query ownArticles {
    ownArticles {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "ownArticles should return an error user is not logged in" do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> get("/api", query: @query)
    |> json_response(200)

    assert res == %{
      "data" => %{
        "ownArticles" => nil
      },
      "errors" => [%{
        "locations" => [%{"column" => 0, "line" => 2}],
        "message" => "Nur angemeldete Nutzer können eigene Beiträge abrufen.",
        "path" => ["ownArticles"]
      }]
    }
  end
  
  
  @query """
  query topic($topic: String!) {
    topic(topic: $topic) {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "topic field should return all articles for given topic for lehrer_group", %{lehrer_jwt: lehrer_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
    |> get("/api", query: @query, variables: %{topic: "KleinKunst 2018"})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "topic" => [
          %{"is_pinned_to_top" => false, "preview" => "Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.", "ready_to_publish" => false, "title" => "Der Vorausscheid", "topic" => "KleinKunst 2018"},
          %{"is_pinned_to_top" => false, "preview" => "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.", "ready_to_publish" => false, "title" => "Der Podcast zum WB 2", "topic" => "KleinKunst 2018"}
        ]
      },
    }
  end
  
  @query """
  query topic($topic: String!) {
    topic(topic: $topic) {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "topic field should return all articles for given topic for schueler_group", %{schueler_jwt: schueler_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{schueler_jwt}")
    |> get("/api", query: @query, variables: %{topic: "KleinKunst 2018"})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "topic" => [
          %{"is_pinned_to_top" => false, "preview" => "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.", "ready_to_publish" => false, "title" => "Der Podcast zum WB 2", "topic" => "KleinKunst 2018"}
        ]
      },
    }
  end
  
  @query """
  query topic($topic: String!) {
    topic(topic: $topic) {
      title
      preview
      topic
      ready_to_publish
      is_pinned_to_top
    }
  }
  """
  test "topic field should return all articles for given topic for not logged in user", %{user_jwt: user_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{user_jwt}")
    |> get("/api", query: @query, variables: %{topic: "KleinKunst 2018"})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "topic" => []
      },
    }
  end
end