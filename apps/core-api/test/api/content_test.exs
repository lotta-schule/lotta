defmodule Api.ContentTest do
  use Api.DataCase

  alias Api.Content

  describe "articles" do
    alias Api.Content.Article

    @valid_attrs %{pageName: "some pageName", preview: "some preview", title: "some title"}
    @update_attrs %{pageName: "some updated pageName", preview: "some updated preview", title: "some updated title"}
    @invalid_attrs %{pageName: nil, preview: nil, title: nil}

    def article_fixture(attrs \\ %{}) do
      {:ok, article} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Content.create_article()

      article
    end

    test "list_articles/0 returns all articles" do
      article = article_fixture()
      assert Content.list_articles() == [article]
    end

    test "get_article!/1 returns the article with given id" do
      article = article_fixture()
      assert Content.get_article!(article.id) == article
    end

    test "create_article/1 with valid data creates a article" do
      assert {:ok, %Article{} = article} = Content.create_article(@valid_attrs)
      assert article.pageName == "some pageName"
      assert article.preview == "some preview"
      assert article.title == "some title"
    end

    test "create_article/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Content.create_article(@invalid_attrs)
    end

    test "update_article/2 with valid data updates the article" do
      article = article_fixture()
      assert {:ok, %Article{} = article} = Content.update_article(article, @update_attrs)
      assert article.pageName == "some updated pageName"
      assert article.preview == "some updated preview"
      assert article.title == "some updated title"
    end

    test "update_article/2 with invalid data returns error changeset" do
      article = article_fixture()
      assert {:error, %Ecto.Changeset{}} = Content.update_article(article, @invalid_attrs)
      assert article == Content.get_article!(article.id)
    end

    test "delete_article/1 deletes the article" do
      article = article_fixture()
      assert {:ok, %Article{}} = Content.delete_article(article)
      assert_raise Ecto.NoResultsError, fn -> Content.get_article!(article.id) end
    end

    test "change_article/1 returns a article changeset" do
      article = article_fixture()
      assert %Ecto.Changeset{} = Content.change_article(article)
    end
  end
end
