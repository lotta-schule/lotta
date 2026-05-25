defmodule LottaWeb.SearchResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: false

  import Ecto.Query
  import Lotta.Factory

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Content.Article

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Repo.put_prefix(@prefix)

    admin =
      Repo.one!(
        from(u in User, where: u.email == ^"alexis.rinaldoni@lotta.schule"),
        prefix: @prefix
      )

    lehrer =
      Repo.one!(
        from(u in User, where: u.email == ^"eike.wiewiorra@lotta.schule"),
        prefix: @prefix
      )

    user =
      Repo.one!(
        from(u in User, where: u.email == ^"doro@lotta.schule"),
        prefix: @prefix
      )

    lehrer_group =
      Repo.one!(from(ug in UserGroup, where: ug.name == ^"Lehrer"), prefix: @prefix)

    search_category = insert(:category, title: "Suche")

    nipple =
      insert(:article,
        title: "\u{201E}Nipple Jesus\u{201D}- eine extreme Erfahrung",
        published: true,
        category_id: search_category.id
      )

    insert(:content_module, article_id: nipple.id)

    podcast_preview =
      "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert."

    podcast =
      insert(:article,
        title: "Der Podcast zum WB 2",
        preview: podcast_preview,
        published: true,
        category_id: search_category.id
      )
      |> with_groups([lehrer_group])

    insert(:content_module, article_id: podcast.id)

    {:ok, admin_jwt, _} = AccessToken.encode_and_sign(admin)
    {:ok, lehrer_jwt, _} = AccessToken.encode_and_sign(lehrer)
    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)

    {:ok,
     %{
       admin_account: admin,
       admin_jwt: admin_jwt,
       lehrer_account: lehrer,
       lehrer_jwt: lehrer_jwt,
       user_account: user,
       user_jwt: user_jwt,
       tenant: tenant
     }}
  end

  describe "search query" do
    @query """
    query Search($searchText: String!, $options: SearchOptions){
      search(searchText: $searchText, options: $options) {
        title
        preview
      }
    }
    """

    test "search for public articles should return them" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query, variables: %{searchText: "Nipple Jesus"})
        |> json_response(200)

      assert %{
               "data" => %{
                 "search" => results
               }
             } = res

      assert Enum.any?(
               results,
               &(Map.get(&1, "title") == "„Nipple Jesus”- eine extreme Erfahrung")
             )
    end

    test "search for restricted articles should not return them when user is not in the right group",
         %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api",
          query: @query,
          variables: %{
            searchText:
              "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten."
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "search" => results
               }
             } = res

      refute Enum.any?(
               results,
               &(Map.get(&1, "title") == "Der Podcast zum WB 2")
             )
    end

    test "search for a restricted article should list it in reuslts when user is in the right groupe",
         %{
           lehrer_jwt: lehrer_jwt
         } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{lehrer_jwt}")
        |> get("/api",
          query: @query,
          variables: %{
            searchText:
              "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten."
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "search" => results
               }
             } = res

      assert Enum.any?(results, fn %{"title" => title} -> title == "Der Podcast zum WB 2" end)
    end

    test "search for a restricted article should list it in results when user is admin", %{
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api",
          query: @query,
          variables: %{
            searchText:
              "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten."
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "search" => searchresults
               }
             } = res

      assert Enum.any?(searchresults, fn result ->
               result == %{
                 "preview" =>
                   "Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.",
                 "title" => "Der Podcast zum WB 2"
               }
             end)
    end

    test "search restricted to category should only list results from that category", %{
      admin_jwt: jwt,
      tenant: t
    } do
      projekt_category = insert(:category, title: "Projekt")
      other_category = insert(:category, title: "Other")

      a1 =
        insert(:article,
          title: "Der Vorausscheid",
          preview: "Kunst Projekt",
          category_id: projekt_category.id,
          published: true
        )

      insert(:content_module, article_id: a1.id)

      a2 =
        insert(:article,
          title: "Vorausscheid Kunst",
          preview: "in a different category",
          category_id: other_category.id,
          published: true
        )

      insert(:content_module, article_id: a2.id)

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{jwt}")
        |> get("/api",
          query: @query,
          variables: %{
            searchText: "Vorausscheid Kunst",
            options: %{category_id: projekt_category.id}
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "search" => results
               }
             } = res

      assert Enum.all?(results, fn %{"title" => title} ->
               article =
                 Repo.one!(
                   from(a in Article, where: a.title == ^title),
                   prefix: t.prefix
                 )

               article.category_id == projekt_category.id
             end)
    end

    test "passing no category_id to config should be valid" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api",
          query: @query,
          variables: %{
            searchText: "Nipple Jesus"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "search" => results
               }
             } = res

      assert Enum.any?(
               results,
               &(Map.get(&1, "title") == "„Nipple Jesus”- eine extreme Erfahrung")
             )
    end
  end
end
