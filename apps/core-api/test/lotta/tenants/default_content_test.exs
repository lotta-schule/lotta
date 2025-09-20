defmodule Lotta.Tenants.DefaultContentTest do
  @moduledoc false

  use Lotta.DataCase
  use Bamboo.Test

  import Ecto.Query

  alias Lotta.{Tenants}
  alias Lotta.Content.Article
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Storage.{File, Directory}
  alias Lotta.Tenants.Category
  alias Lotta.Accounts.Authentication

  setup do
    Tesla.Mock.mock(fn
      %{url: "https://plausible.io/" <> _rest} = env ->
        %Tesla.Env{env | status: 200, body: "OK"}
      env ->
        %Tesla.Env{env | status: 200, body: "OK"} # fallback if you want, or raise for unexpected
    end)
    :ok
  end

  describe "default content" do
    test "should create a tenant with all the default content" do
      assert {:ok, tenant} =
               Tenants.create_tenant(
                 user_params: %{
                   name: "Max Mustermann",
                   email: "maxmustermann@lotta.schule"
                 },
                 tenant: %{
                   slug: "default-content-test",
                   title: "Default Content Test",
                   prefix: "default_content_test"
                 }
               )

      Repo.put_prefix(tenant.prefix)

      # Groups
      groups = Repo.all(UserGroup)
      assert Enum.count(groups) == 3
      admin_group = assert Enum.find(groups, &(&1.is_admin_group and &1.name == "Administrator"))
      refute is_nil(Enum.find(groups, &(&1.name == "Lehrer")))
      refute is_nil(Enum.find(groups, &(&1.name == "Schüler")))

      # User
      users = Repo.all(User)
      assert Enum.count(users) == 1
      user = assert List.first(users)
      [%{name: "Max Mustermann", email: "maxmustermann@lotta.schule"}] = users

      assert [^admin_group] =
               user
               |> Repo.preload(:groups)
               |> Map.fetch!(:groups)

      assert_delivered_email_matches(%{
        to: [nil: "maxmustermann@lotta.schule"],
        text_body: text_body
      })

      [_matchingstring, password] = Regex.run(~r/Passwort: (.*)\n/, text_body)
      assert Authentication.verify_user_pass(user, password)

      # Homepage
      categories = Repo.all(Category)
      assert Enum.count(categories, & &1.is_homepage) == 1

      assert Enum.count(categories) == 2
      refute is_nil(Enum.find(categories, &(&1.title == "Über lotta")))

      assert articles =
               Article
               |> Repo.all()
               |> Enum.map(&Repo.preload(&1, [:users, :preview_image_file, :category]))

      assert Enum.count(articles) == 3
      assert Enum.all?(articles, &(&1.tags == ["Hilfe"]))
      assert Enum.all?(articles, &([%User{name: "Max Mustermann"}] = &1.users))
      assert Enum.all?(articles, &(%File{} = &1.preview_image_file))
      assert Enum.all?(articles, &(%Category{title: "Über lotta"} = &1.category))

      assert article =
               Repo.one!(
                 from(a in Article,
                   where:
                     a.title == ^"Erste Schritte mit Lotta" and
                       a.preview == ^"Erstellen und bearbeiten Sie Kategorien"
                 )
               )
               |> Repo.preload(:content_modules)

      assert Enum.count(article.content_modules) == 11

      assert article =
               Repo.one!(
                 from(a in Article,
                   where:
                     a.title == ^"Erste Schritte mit Lotta" and
                       a.preview == ^"Nutzergruppen & Einschreibeschlüssel organisieren"
                 )
               )
               |> Repo.preload(:content_modules)

      assert Enum.count(article.content_modules) == 8

      assert article.content_modules
             |> Enum.flat_map(&Repo.preload(&1, :files).files)
             |> Enum.count() == 6

      assert article =
               Repo.one!(
                 from(a in Article,
                   where: a.title == ^"Willkommen"
                 )
               )
               |> Repo.preload(:content_modules)

      assert "Ihre ersten Schritte mit Lotta" = article.preview
      assert Enum.count(article.content_modules) == 1

      assert public_directory =
               from(d in Directory,
                 where: is_nil(d.parent_directory_id) and is_nil(d.user_id)
               )
               |> Repo.one()
               |> Repo.preload([:files, :user])

      assert Enum.count(public_directory.files) == 17
    end
  end
end
