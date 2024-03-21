defmodule Lotta.ContentTest do
  @moduledoc false

  use Lotta.DataCase

  alias Lotta.{Content, Fixtures, Repo}
  alias Lotta.Accounts.UserGroup

  import Ecto.Query

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

    test "unpublish_articles_of_single_group/1 should unpublish articles of a given group" do
      assign_groups = fn model, groups ->
        model
        |> Repo.preload(:groups)
        |> Ecto.Changeset.change()
        |> Ecto.Changeset.put_assoc(:groups, groups)
        |> Repo.update!(prefix: Ecto.get_meta(model, :prefix))
      end

      verwaltung_group = Repo.one(from(UserGroup) |> where(name: "Verwaltung"), prefix: @prefix)
      lehrer_group = Repo.one(from(UserGroup) |> where(name: "Lehrer"), prefix: @prefix)

      user = Fixtures.fixture(:registered_user)

      article1 =
        Fixtures.fixture(:article, user)
        |> Ecto.Changeset.change(published: true)
        |> Repo.update!()
        |> assign_groups.([lehrer_group])
        |> Repo.preload(:groups)

      article2 =
        Fixtures.fixture(:article, user)
        |> Ecto.Changeset.change(published: true)
        |> Repo.update!()
        |> assign_groups.([lehrer_group])
        |> Repo.preload(:groups)

      article3 =
        Fixtures.fixture(:article, user)
        |> Ecto.Changeset.change(published: true)
        |> Repo.update!()
        |> assign_groups.([verwaltung_group, lehrer_group])
        |> Repo.preload(:groups)

      assert {:ok, unpublished_articles} =
               Content.unpublish_articles_of_single_group(lehrer_group)

      assert Enum.all?(unpublished_articles, fn article ->
               not Map.get(article, :published) and
                 Enum.member?([article1.id, article2.id], article.id)
             end)

      assert {:ok, []} ==
               Content.unpublish_articles_of_single_group(lehrer_group)

      article3 =
        article3
        |> Repo.reload!()
        |> Repo.preload(:groups)

      assert [^verwaltung_group, ^lehrer_group] = Map.get(article3, :groups)
      assert Map.get(article3, :published)
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
