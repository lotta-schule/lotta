defmodule Api.DefaultContentTest do
  @moduledoc false

  use Api.DataCase
  use Bamboo.Test

  import Ecto.Query

  alias Api.Repo
  alias Api.Accounts.{User, UserGroup}
  alias Api.Storage.{File, Directory}
  alias Api.Content.Article
  alias Api.System.{Category, DefaultContent}
  alias Api.Accounts.Authentication

  describe "default content" do
    test "should create a default admin user and send him or her a mail with his or her password" do
      DefaultContent.create_default_content()
      users = Repo.all(User)
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

    test "should create default groups" do
      DefaultContent.create_default_content()
      groups = Repo.all(UserGroup)
      assert Enum.count(groups) == 3
      refute is_nil(Enum.find(groups, &(&1.is_admin_group and &1.name == "Administrator")))
      refute is_nil(Enum.find(groups, &(&1.name == "Lehrer")))
      refute is_nil(Enum.find(groups, &(&1.name == "Schüler")))
    end

    test "should create a home page" do
      DefaultContent.create_default_content()
      categories = Repo.all(Category)
      assert Enum.count(categories, & &1.is_homepage) == 1
    end

    test "should create content category" do
      DefaultContent.create_default_content()
      categories = Repo.all(Category)
      assert Enum.count(categories) == 2
      refute is_nil(Enum.find(categories, &(&1.title == "Über lotta")))
    end

    test "should have three articles in help category" do
      DefaultContent.create_default_content()

      articles =
        Article
        |> Repo.all()
        |> Enum.map(&Repo.preload(&1, [:users, :preview_image_file, :category]))

      assert 3 = Enum.count(articles)
      assert Enum.all?(articles, &(&1.topic == "Hilfe"))
      assert Enum.all?(articles, &([%User{name: "Max Mustermann"}] = &1.users))
      assert Enum.all?(articles, &(%File{} = &1.preview_image_file))
      assert Enum.all?(articles, &(%Category{title: "Über lotta"} = &1.category))
    end

    test "default article about categories should have correct format" do
      DefaultContent.create_default_content()

      article =
        Article
        |> Repo.get_by!(
          title: "Erste Schritte mit Lotta",
          preview: "Erstellen und bearbeiten Sie Kategorien"
        )
        |> Repo.preload(:content_modules)

      assert Enum.count(article.content_modules) == 11
    end

    test "default article about users and groups should have correct format" do
      DefaultContent.create_default_content()

      article =
        Article
        |> Repo.get_by!(
          title: "Erste Schritte mit Lotta",
          preview: "Nutzergruppen & Einschreibeschlüssel organisieren"
        )
        |> Repo.preload(:content_modules)

      assert Enum.count(article.content_modules) == 8

      assert article.content_modules
             |> Enum.flat_map(&Repo.preload(&1, :files).files)
             |> Enum.count() == 6
    end

    test "default Welcome article should have correct format" do
      DefaultContent.create_default_content()

      article =
        Article
        |> Repo.get_by!(title: "Willkommen")
        |> Repo.preload(:content_modules)

      assert "Ihre ersten Schritte mit Lotta" = article.preview
      assert Enum.count(article.content_modules) == 1
    end

    test "there should be a public directory" do
      DefaultContent.create_default_content()

      public_directory =
        from(d in Directory,
          where: is_nil(d.parent_directory_id) and is_nil(d.user_id)
        )
        |> Repo.one()
        |> Repo.preload([:files, :user])

      refute is_nil(public_directory)
      assert Enum.count(public_directory.files) == 17
    end
  end
end
