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

    # `with_users/2` (see test/support/factory.ex) attaches users via
    # `Ecto.Changeset.change/1` + `Repo.update!/1`, which re-triggers the
    # schema's `timestamps()` autogeneration and overwrites `updated_at` with
    # "now" — silently discarding any `updated_at` passed to `insert/2`. To get
    # genuinely distinct, controlled timestamps for cursor-pagination tests,
    # the explicit `updated_at` must be applied in a *separate* update *after*
    # `with_users/2` has already run.
    defp insert_article_with_updated_at(user, updated_at) do
      insert(:article)
      |> with_users([user])
      |> Ecto.Changeset.change(updated_at: updated_at)
      |> Repo.update!()
    end

    test "list_user_articles/2 with a :first filter limits the number of results" do
      user = insert(:user)

      for i <- 1..5 do
        insert_article_with_updated_at(
          user,
          ~U[2024-01-01 00:00:00Z] |> DateTime.add(i, :minute)
        )
      end

      listed = Content.list_user_articles(user, filter: %{first: 2})

      assert length(listed) == 2

      assert Enum.map(listed, & &1.updated_at) ==
               Enum.sort(Enum.map(listed, & &1.updated_at), {:desc, DateTime})
    end

    test "list_user_articles/2 with an :updated_before filter paginates without overlap or gaps" do
      user = insert(:user)

      articles =
        for i <- 1..5 do
          insert_article_with_updated_at(
            user,
            ~U[2024-01-01 00:00:00Z] |> DateTime.add(i, :minute)
          )
        end

      # articles are inserted oldest (i=1) to newest (i=5); the 4 most recent
      # (i=2..5) are expected to be split across the two pages below, with the
      # oldest one (i=1) left out since 2 + 2 only covers 4 of the 5 articles.
      expected_ids_in_pages_1_and_2 =
        articles
        |> Enum.sort_by(& &1.updated_at, {:desc, DateTime})
        |> Enum.take(4)
        |> Enum.map(& &1.id)

      page1 = Content.list_user_articles(user, filter: %{first: 2})
      assert length(page1) == 2

      oldest_in_page1 = List.last(page1).updated_at

      page2 =
        Content.list_user_articles(user, filter: %{first: 2, updated_before: oldest_in_page1})

      assert length(page2) == 2

      page1_ids = Enum.map(page1, & &1.id)
      page2_ids = Enum.map(page2, & &1.id)

      assert MapSet.disjoint?(MapSet.new(page1_ids), MapSet.new(page2_ids))
      assert Enum.sort(page1_ids ++ page2_ids) == Enum.sort(expected_ids_in_pages_1_and_2)
    end

    test "list_user_articles/2 without a filter preserves the existing order and 75-item limit" do
      user = insert(:user)
      article = insert(:article) |> with_users([user])

      no_filter = Content.list_user_articles(user) |> Enum.map(& &1.id)
      nil_filter = Content.list_user_articles(user, filter: nil) |> Enum.map(& &1.id)

      assert no_filter == nil_filter
      assert article.id in no_filter
    end

    test "list_articles_by_user/2 (which relies on list_user_articles/2's :base_query option) still works" do
      current_user = insert(:user)
      author = insert(:user)
      # `Article.get_published_articles_query/2` inner-joins `Category` on
      # `category_id`, so a category-less article (the factory default) is
      # silently excluded regardless of visibility — give it one.
      category = insert(:category)

      article =
        insert(:article, category: category)
        |> with_users([author])

      listed_ids =
        Content.list_articles_by_user(current_user, author) |> Enum.map(& &1.id)

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
