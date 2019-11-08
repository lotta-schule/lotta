defmodule Api.ContentTest do
  use Api.DataCase
  alias Api.Fixtures
  alias Api.{Content}

  
  describe "article" do
    alias Api.Content.Article

    test "get_article!/1 returns the article with given id" do
      user = Fixtures.fixture(:registered_user)
      article = Fixtures.fixture(:article, user)
      assert Api.Repo.preload(Content.get_article!(article.id), [:category, :users]) == article
    end

    test "list_users_articles/2 should return a users' visible articles" do
      user = Fixtures.fixture(:registered_user)
      article = Fixtures.fixture(:article, user)
      |> Api.Repo.preload([:category, :users])
      listed_articles = Enum.map(Content.list_user_articles(Fixtures.fixture(:tenant), user), fn article -> Api.Repo.preload(article, [:category, :users]) end)
      assert listed_articles == [article]
    end
    
    test "list_unpublished_articles/2 should return the tenants unpublished articles" do
      user = Fixtures.fixture(:registered_user)
      admin = Fixtures.fixture(:admin_user) |> Api.Repo.preload([:tenant, :groups])
      article = Fixtures.fixture(:unpublished_article, user)
      |> Api.Repo.preload([:category, :users])

      listed_articles = Enum.map(Content.list_unpublished_articles(Fixtures.fixture(:tenant)), fn article -> Api.Repo.preload(article, [:category, :users]) end)
      assert listed_articles == [article]
    end
    
    test "list_user_articles/2 should return the tenants users' articles" do
      user = Fixtures.fixture(:registered_user)
      article = Fixtures.fixture(:unpublished_article, user)
      |> Api.Repo.preload([:category, :users])

      listed_articles = Enum.map(Content.list_user_articles(Fixtures.fixture(:tenant), user), fn article -> Api.Repo.preload(article, [:category, :users]) end)
      assert listed_articles == [article]
    end
    
    test "delete_article/1 should delete an article" do
      user = Fixtures.fixture(:registered_user)
      article = Fixtures.fixture(:unpublished_article, user)
      
      Content.delete_article(article)

      assert_raise Ecto.NoResultsError, fn ->
        Api.Repo.get!(Article, article.id)
      end
    end
    
  end

end