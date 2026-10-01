defmodule LottaWeb.ArticleReactionResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: true

  import Ecto.Query
  import Lotta.Factory

  alias Lotta.Content.ArticleReaction
  alias Lotta.Content
  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.User

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Repo.put_prefix(@prefix)

    user1 =
      Repo.one!(from(u in User, where: u.email == ^"alexis.rinaldoni@lotta.schule"),
        prefix: tenant.prefix
      )

    user2 =
      insert(:user, email: "arr-eike@lotta.schule", name: "Eike Wiewiorra", nickname: "Chef")

    [{user1, user1_jwt}, {user2, user2_jwt}] =
      Enum.map([user1, user2], fn user ->
        {:ok, jwt, _} = AccessToken.encode_and_sign(user)
        {user, jwt}
      end)

    article = insert(:article, title: "Der Podcast zum WB 2", published: true)

    {:ok,
     %{
       user1: user1,
       user1_jwt: user1_jwt,
       user2: user2,
       user2_jwt: user2_jwt,
       article: article,
       tenant: tenant
     }}
  end

  describe "article reaction count" do
    @query """
    query article($id: ID!) {
      article(id: $id) {
        id
        title
        reactionCounts {
          type
          count
        }
      }
    }
    """
    test "returns an empty article_reaction_count", %{article: article, user1_jwt: jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{jwt}")
        |> get("/api", query: @query, variables: %{id: article.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "article" => %{
                   "title" => "Der Podcast zum WB 2",
                   "reactionCounts" => []
                 }
               }
             } = res
    end

    test "returns a non-empty article_reaction_count", %{
      article: article,
      user1: user1,
      user2: user2,
      user1_jwt: jwt
    } do
      Content.create_article_reaction(article, user1, "lemon")
      Content.create_article_reaction(article, user2, "pepper")

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{jwt}")
        |> get("/api", query: @query, variables: %{id: article.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "article" => %{
                   "title" => "Der Podcast zum WB 2",
                   "reactionCounts" => [
                     %{
                       "type" => "LEMON",
                       "count" => 1
                     },
                     %{
                       "type" => "PEPPER",
                       "count" => 1
                     }
                   ]
                 }
               }
             } = res
    end
  end

  describe "get reaction users" do
    @query """
    query users($id: ID!, $type: ArticleReactionType!) {
      getReactionUsers(id: $id, type: $type) {
        email
      }
    }
    """
    test "returns an empty user list", %{article: article, user1_jwt: jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{jwt}")
        |> get("/api", query: @query, variables: %{id: article.id, type: "PEPPER"})
        |> json_response(200)

      assert %{
               "data" => %{
                 "getReactionUsers" => []
               }
             } = res
    end

    test "returns a non-empty  user list", %{
      article: article,
      user1: user1,
      user2: user2,
      user1_jwt: jwt
    } do
      Content.create_article_reaction(article, user1, "lemon")
      Content.create_article_reaction(article, user2, "pepper")

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{jwt}")
        |> get("/api", query: @query, variables: %{id: article.id, type: "PEPPER"})
        |> json_response(200)

      assert %{
               "data" => %{
                 "getReactionUsers" => [
                   %{
                     "email" => "arr-eike@lotta.schule"
                   }
                 ]
               }
             } = res
    end
  end

  describe "createArticleReaction mutation" do
    @mutation """
    mutation reactToArticle($id: ID!, $type: ArticleReactionType!) {
      reactToArticle(articleId: $id, type: $type) {
        reactionCounts {
          type
          count
        }
      }
    }
    """

    test "add a new reaction when no reaction was given yet", %{article: article, user1_jwt: jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{jwt}")
        |> post("/api",
          query: @mutation,
          variables: %{
            id: article.id,
            type: "PEPPER"
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "reactToArticle" => %{
                   "reactionCounts" => [
                     %{
                       "type" => "PEPPER",
                       "count" => 1
                     }
                   ]
                 }
               }
             }
    end

    test "change reaction if another reaction was already given", %{
      article: article,
      user1: user,
      user1_jwt: jwt
    } do
      Content.create_article_reaction(article, user, "LEMON")

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{jwt}")
        |> post("/api",
          query: @mutation,
          variables: %{
            id: article.id,
            type: "PEPPER"
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "reactToArticle" => %{
                   "reactionCounts" => [
                     %{
                       "type" => "PEPPER",
                       "count" => 1
                     }
                   ]
                 }
               }
             }
    end

    test "remove reaction if same reaction was already given", %{
      article: article,
      user2: user,
      user2_jwt: jwt
    } do
      Content.create_article_reaction(article, user, "PEPPER")

      type = "PEPPER"

      assert Repo.aggregate(
               from(ar in ArticleReaction,
                 where:
                   ar.article_id == ^article.id and ar.user_id == ^user.id and ar.type == ^type
               ),
               :count,
               prefix: @prefix
             ) == 1

      from(ar in ArticleReaction,
        where: ar.article_id == ^article.id and ar.user_id == ^user.id and ar.type == ^type
      )
      |> Lotta.Repo.all(prefix: Ecto.get_meta(article, :prefix))

      from(ar in ArticleReaction,
        where: ar.article_id == ^article.id and ar.user_id == ^user.id
      )
      |> Lotta.Repo.all(prefix: Ecto.get_meta(article, :prefix))

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{jwt}")
        |> post("/api",
          query: @mutation,
          variables: %{
            id: article.id,
            type: "PEPPER"
          }
        )
        |> json_response(200)

      assert Repo.aggregate(ArticleReaction, :count, :type,
               article_id: article.id,
               type: "PEPPER",
               prefix: @prefix
             ) == 0

      assert res == %{
               "data" => %{
                 "reactToArticle" => %{
                   "reactionCounts" => []
                 }
               }
             }
    end
  end
end
