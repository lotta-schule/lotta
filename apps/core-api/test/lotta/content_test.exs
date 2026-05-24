defmodule Lotta.ContentTest do
  @moduledoc false

  use Lotta.DataCase, async: true

  import Lotta.Factory

  alias Lotta.{Content, Repo}

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)
    :ok
  end

  describe "article" do
    alias Lotta.Content.Article

    test "get_article/1 returns the article with given id" do
      user = insert(:user)

      article =
        insert(:article)
        |> with_users([user])
        |> Repo.reload!()
        |> Repo.preload([:category, :users])

      assert Repo.preload(Content.get_article(article.id), [:category, :users]) == article
    end

    test "list_users_articles/2 should return a users' visible articles" do
      user = insert(:user)
      article = insert(:article) |> with_users([user])

      listed_ids = Content.list_user_articles(user) |> Enum.map(& &1.id)

      assert article.id in listed_ids
    end

    test "list_unpublished_articles/2 should return all unpublished articles" do
      user = insert(:user)
      article = insert(:unpublished_article) |> with_users([user])

      listed_ids = Content.list_unpublished_articles() |> Enum.map(& &1.id)

      assert article.id in listed_ids
    end

    test "list_user_articles/2 should return users' articles" do
      user = insert(:user)
      article = insert(:unpublished_article) |> with_users([user])

      listed_ids = Content.list_user_articles(user) |> Enum.map(& &1.id)

      assert article.id in listed_ids
    end

    test "unpublish_articles_of_single_group/1 should unpublish articles of a given group" do
      assign_groups = fn model, groups ->
        model
        |> Repo.preload(:groups)
        |> Ecto.Changeset.change()
        |> Ecto.Changeset.put_assoc(:groups, groups)
        |> Repo.update!(prefix: Ecto.get_meta(model, :prefix))
      end

      verwaltung_group = insert(:group)
      lehrer_group = insert(:group)

      user = insert(:user)

      article1 =
        insert(:article, published: true)
        |> assign_groups.([lehrer_group])
        |> Repo.preload(:groups)

      article2 =
        insert(:article, published: true)
        |> assign_groups.([lehrer_group])
        |> Repo.preload(:groups)

      article3 =
        insert(:article, published: true)
        |> assign_groups.([verwaltung_group, lehrer_group])
        |> Repo.preload(:groups)

      # suppress unused warning
      _ = user

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
      user = insert(:user)
      article = insert(:unpublished_article) |> with_users([user])

      Content.delete_article(article)

      assert_raise Ecto.NoResultsError, fn ->
        Repo.get!(Article, article.id)
      end
    end
  end
end
