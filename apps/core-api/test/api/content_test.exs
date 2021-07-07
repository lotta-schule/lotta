defmodule Lotta.ContentTest do
  @moduledoc false

  use Lotta.DataCase

  alias Lotta.{Content, Fixtures, Repo}

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)

    :ok
  end

  describe "article" do
    alias Lotta.Content.Article

    test "get_article/1 returns the article with given id" do
      user = Fixtures.fixture(:registered_user)
      article = Fixtures.fixture(:article, user)
      assert Lotta.Repo.preload(Content.get_article(article.id), [:category, :users]) == article
    end

    test "list_users_articles/2 should return a users' visible articles" do
      user = Fixtures.fixture(:registered_user)

      article =
        Fixtures.fixture(:article, user)
        |> Lotta.Repo.preload([:category, :users])

      listed_articles =
        Enum.map(Content.list_user_articles(user), fn article ->
          Lotta.Repo.preload(article, [:category, :users])
        end)

      assert listed_articles == [article]
    end

    test "list_unpublished_articles/2 should return all unpublished articles" do
      user = Fixtures.fixture(:registered_user)

      article =
        Fixtures.fixture(:unpublished_article, user)
        |> Lotta.Repo.preload([:category, :users])

      listed_articles =
        Enum.map(Content.list_unpublished_articles(), fn article ->
          Lotta.Repo.preload(article, [:category, :users])
        end)

      assert List.last(listed_articles) == article
    end

    test "list_user_articles/2 should return users' articles" do
      user = Fixtures.fixture(:registered_user)

      article =
        Fixtures.fixture(:unpublished_article, user)
        |> Lotta.Repo.preload([:category, :users])

      listed_articles =
        Enum.map(Content.list_user_articles(user), fn article ->
          Lotta.Repo.preload(article, [:category, :users])
        end)

      assert listed_articles == [article]
    end

    test "delete_article/1 should delete an article" do
      user = Fixtures.fixture(:registered_user)
      article = Fixtures.fixture(:unpublished_article, user)

      Content.delete_article(article)

      assert_raise Ecto.NoResultsError, fn ->
        Lotta.Repo.get!(Article, article.id)
      end
    end
  end
end
