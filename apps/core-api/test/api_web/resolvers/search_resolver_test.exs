defmodule ApiWeb.SearchResolverTest do
  @moduledoc """
    Test Module for SearchResolver
  """

  alias ApiWeb.Auth.AccessToken
  alias Api.Repo
  alias Api.Accounts.User
  alias Api.Content

  use ApiWeb.ConnCase

  setup do
    Repo.Seeder.seed()
    Elasticsearch.delete(Api.Elasticsearch.Cluster, "*")
    :timer.sleep(500)
    Elasticsearch.Index.hot_swap(Api.Elasticsearch.Cluster, "articles")
    :timer.sleep(500)

    admin = Repo.get_by!(User, email: "alexis.rinaldoni@lotta.schule")
    lehrer = Repo.get_by!(User, email: "eike.wiewiorra@lotta.schule")
    user = Repo.get_by!(User, email: "doro@lotta.schule")

    {:ok, admin_jwt, _} =
      AccessToken.encode_and_sign(admin, %{email: admin.email, name: admin.name})

    {:ok, lehrer_jwt, _} =
      AccessToken.encode_and_sign(lehrer, %{email: lehrer.email, name: lehrer.name})

    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user, %{email: user.email, name: user.name})

    {:ok,
     %{
       admin_account: admin,
       admin_jwt: admin_jwt,
       lehrer_account: lehrer,
       lehrer_jwt: lehrer_jwt,
       user_account: user,
       user_jwt: user_jwt
     }}
  end

  describe "search query" do
    @query """
    query Search($searchText: String!){
      search(searchText: $searchText) {
        title
        preview
      }
    }
    """

    test "search for public articles should return them" do
      res =
        build_conn()
        |> get("/api", query: @query, variables: %{searchText: "Nipple Jesus"})
        |> json_response(200)

      assert %{
               "data" => %{
                 "search" => results
               }
             } = res

      assert Enum.any?(
               results,
               &(Map.get(&1, "title") == "„Nipple Jesus“- eine extreme Erfahrung")
             )
    end

    test "search for restricted articles should not return them when user is not in the right group",
         %{user_jwt: user_jwt} do
      res =
        build_conn()
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

    test "search for a restricted article should be returned when user is in the right groupe", %{
      lehrer_jwt: lehrer_jwt
    } do
      res =
        build_conn()
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

    test "search for a restricted article should be returned when user is admin", %{
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
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

    test "updated article should be indexed" do
      {:ok, article} =
        Api.Content.Article
        |> Repo.get_by!(title: "Beitrag Projekt 1")
        |> Content.update_article(%{title: "Neuer Artikel nur für die Suche"})

      {:ok, %{"_source" => %{"title" => title}}} =
        Elasticsearch.get(Api.Elasticsearch.Cluster, "/articles/_doc/#{article.id}")

      assert title == "Neuer Artikel nur für die Suche"
    end

    test "deleted article should be deleted from index" do
      {:ok, %{id: id}} =
        Api.Content.Article
        |> Repo.get_by!(title: "Beitrag Projekt 1")
        |> Content.delete_article()

      {result, _} = Elasticsearch.get(Api.Elasticsearch.Cluster, "/articles/_doc/#{id}")

      assert result == :error
    end
  end
end
