defmodule Api.ContentTest do
  use Api.DataCase

  alias Api.Content

  describe "articles" do
    alias Api.Content.Article

    @valid_attrs %{page_name: "some page_name", preview: "some preview", title: "some title"}
    @update_attrs %{page_name: "some updated page_name", preview: "some updated preview", title: "some updated title"}
    @invalid_attrs %{page_name: nil, preview: nil, title: nil}

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
      assert article.page_name == "some page_name"
      assert article.preview == "some preview"
      assert article.title == "some title"
    end

    test "create_article/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Content.create_article(@invalid_attrs)
    end

    test "update_article/2 with valid data updates the article" do
      article = article_fixture()
      assert {:ok, %Article{} = article} = Content.update_article(article, @update_attrs)
      assert article.page_name == "some updated page_name"
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

  describe "content_modules" do
    alias Api.Content.ContentModule

    @valid_attrs %{text: "some text", type: "some type"}
    @update_attrs %{text: "some updated text", type: "some updated type"}
    @invalid_attrs %{text: nil, type: nil}

    def content_module_fixture(attrs \\ %{}) do
      {:ok, content_module} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Content.create_content_module()

      content_module
    end

    test "list_content_modules/0 returns all content_modules" do
      content_module = content_module_fixture()
      assert Content.list_content_modules() == [content_module]
    end

    test "get_content_module!/1 returns the content_module with given id" do
      content_module = content_module_fixture()
      assert Content.get_content_module!(content_module.id) == content_module
    end

    test "create_content_module/1 with valid data creates a content_module" do
      assert {:ok, %ContentModule{} = content_module} = Content.create_content_module(@valid_attrs)
      assert content_module.text == "some text"
      assert content_module.type == "some type"
    end

    test "create_content_module/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Content.create_content_module(@invalid_attrs)
    end

    test "update_content_module/2 with valid data updates the content_module" do
      content_module = content_module_fixture()
      assert {:ok, %ContentModule{} = content_module} = Content.update_content_module(content_module, @update_attrs)
      assert content_module.text == "some updated text"
      assert content_module.type == "some updated type"
    end

    test "update_content_module/2 with invalid data returns error changeset" do
      content_module = content_module_fixture()
      assert {:error, %Ecto.Changeset{}} = Content.update_content_module(content_module, @invalid_attrs)
      assert content_module == Content.get_content_module!(content_module.id)
    end

    test "delete_content_module/1 deletes the content_module" do
      content_module = content_module_fixture()
      assert {:ok, %ContentModule{}} = Content.delete_content_module(content_module)
      assert_raise Ecto.NoResultsError, fn -> Content.get_content_module!(content_module.id) end
    end

    test "change_content_module/1 returns a content_module changeset" do
      content_module = content_module_fixture()
      assert %Ecto.Changeset{} = Content.change_content_module(content_module)
    end
  end
end
