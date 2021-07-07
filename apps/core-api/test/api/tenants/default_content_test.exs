defmodule Lotta.Tenants.DefaultContentTest do
  @moduledoc false

  use Lotta.DataCase, async: true
  use Bamboo.Test

  import Ecto.Query

  alias Lotta.{Repo, Tenants}
  alias Lotta.Content.Article
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Storage.{File, Directory}
  alias Lotta.Tenants.Category
  alias Lotta.Accounts.Authentication

  setup do
    {:ok, tenant} =
      Tenants.create_tenant(
        user_params: %{
          name: "Max Mustermann",
          email: "maxmustermann@lotta.schule"
        },
        tenant: %{
          slug: "default-content-test",
          title: "Default Content Test"
        }
      )

    {:ok, %{tenant: tenant}}
  end

  describe "default content" do
    test "should create a default admin user and send him or her a mail with his or her password",
         %{tenant: t} do
      users = Repo.all(User, prefix: t.prefix)
      assert Enum.count(users) == 1
      user = List.first(users)
      refute is_nil(user)
      assert user.name == "Max Mustermann"
      assert user.email == "maxmustermann@lotta.schule"

      assert [%UserGroup{is_admin_group: true}] =
               user
               |> Repo.preload(:groups)
               |> Map.fetch!(:groups)

      assert_delivered_email_matches(%{
        to: [nil: "maxmustermann@lotta.schule"],
        text_body: text_body
      })

      [_matchingstring, password] = Regex.run(~r/Passwort: (.*)\n/, text_body)
      assert Authentication.verify_user_pass(user, password)
    end

    test "should create default groups", %{tenant: t} do
      groups = Repo.all(UserGroup, prefix: t.prefix)
      assert Enum.count(groups) == 3
      refute is_nil(Enum.find(groups, &(&1.is_admin_group and &1.name == "Administrator")))
      refute is_nil(Enum.find(groups, &(&1.name == "Lehrer")))
      refute is_nil(Enum.find(groups, &(&1.name == "Schüler")))
    end

    test "should create a home page", %{tenant: t} do
      categories = Repo.all(Category, prefix: t.prefix)
      assert Enum.count(categories, & &1.is_homepage) == 1
    end

    test "should create content category", %{tenant: t} do
      categories = Repo.all(Category, prefix: t.prefix)
      assert Enum.count(categories) == 2
      refute is_nil(Enum.find(categories, &(&1.title == "Über lotta")))
    end

    test "should have three articles in help category", %{tenant: t} do
      articles =
        Article
        |> Repo.all(prefix: t.prefix)
        |> Enum.map(&Repo.preload(&1, [:users, :preview_image_file, :category]))

      assert 3 = Enum.count(articles)
      assert Enum.all?(articles, &(&1.tags == ["Hilfe"]))
      assert Enum.all?(articles, &([%User{name: "Max Mustermann"}] = &1.users))
      assert Enum.all?(articles, &(%File{} = &1.preview_image_file))
      assert Enum.all?(articles, &(%Category{title: "Über lotta"} = &1.category))
    end

    test "default article about categories should have correct format", %{tenant: t} do
      article =
        Repo.one!(
          from(a in Article,
            where:
              a.title == ^"Erste Schritte mit Lotta" and
                a.preview == ^"Erstellen und bearbeiten Sie Kategorien"
          ),
          prefix: t.prefix
        )
        |> Repo.preload(:content_modules)

      assert Enum.count(article.content_modules) == 11
    end

    test "default article about users and groups should have correct format", %{tenant: t} do
      article =
        Repo.one!(
          from(a in Article,
            where:
              a.title == ^"Erste Schritte mit Lotta" and
                a.preview == ^"Nutzergruppen & Einschreibeschlüssel organisieren"
          ),
          prefix: t.prefix
        )
        |> Repo.preload(:content_modules)

      assert Enum.count(article.content_modules) == 8

      assert article.content_modules
             |> Enum.flat_map(&Repo.preload(&1, :files).files)
             |> Enum.count() == 6
    end

    test "default Welcome article should have correct format", %{tenant: t} do
      article =
        Repo.one!(
          from(a in Article,
            where: a.title == ^"Willkommen"
          ),
          prefix: t.prefix
        )
        |> Repo.preload(:content_modules)

      assert "Ihre ersten Schritte mit Lotta" = article.preview
      assert Enum.count(article.content_modules) == 1
    end

    test "there should be a public directory", %{tenant: t} do
      public_directory =
        from(d in Directory,
          where: is_nil(d.parent_directory_id) and is_nil(d.user_id)
        )
        |> Repo.one(prefix: t.prefix)
        |> Repo.preload([:files, :user])

      refute is_nil(public_directory)
      assert Enum.count(public_directory.files) == 17
    end

    test "default articles should be indexed in the search", %{tenant: t} do
      articles = Repo.all(Article, prefix: t.prefix)

      assert Enum.all?(articles, fn article ->
               path = "/articles/_doc/#{t.id}--#{article.id}"

               match?(
                 {:ok, %{"_source" => %{"title" => title}}},
                 Elasticsearch.get(Lotta.Elasticsearch.Cluster, path)
               )
             end)
    end
  end
end
