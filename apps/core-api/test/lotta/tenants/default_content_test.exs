defmodule Lotta.Tenants.DefaultContentTest do
  @moduledoc false

  use Lotta.WorkerCase
  use Bamboo.Test

  import Ecto.Query

  alias Lotta.{Tenants, Repo}
  alias Lotta.Tenants.{Category, Tenant}
  alias Lotta.Content.Article
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Storage.{File, Directory}
  alias Lotta.Accounts.Authentication

  setup do
    Tesla.Mock.mock(fn
      %{url: "https://plausible.io/" <> _rest} = env ->
        %Tesla.Env{env | status: 200, body: "OK"}

      %{method: :post, url: "https://auth.sandbox.eduplaces.dev/oauth2/token"} ->
        %Tesla.Env{status: 200, body: %{"access_token" => "fake_token"}}

      %{url: "https://api.sandbox.eduplaces.dev/idm/ep/v1/" <> _path} ->
        %Tesla.Env{status: 404, body: "Not Found"}
    end)

    :ok
  end

  describe "default content" do
    test "should create a tenant with all the default content" do
      tenant = %Tenant{
        slug: "default-content-test",
        title: "Default Content Test"
      }

      user = %User{
        name: "Max Mustermann",
        email: "maxmustermann@lotta.schule"
      }

      assert {:ok, tenant} =
               tenant
               |> Tenants.create_tenant(user)

      Repo.put_prefix(tenant.prefix)

      assert tenant = Tenants.get_tenant_by_slug(tenant.slug)
      assert tenant.state == :active

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

    test "should create tenant without eduplaces_id and skip external sync" do
      tenant = %Tenant{
        slug: "no-eduplaces-test",
        title: "No Eduplaces Test",
        eduplaces_id: nil
      }

      user = %User{
        name: "Test User",
        email: "test@example.com"
      }

      assert {:ok, tenant} = Tenants.create_tenant(tenant, user)

      # Tenant should be created successfully and be active
      assert tenant = Tenants.get_tenant_by_slug(tenant.slug)
      assert tenant.state == :active
      assert is_nil(tenant.eduplaces_id)
    end

    test "should create tenant with empty eduplaces_id and skip external sync" do
      tenant = %Tenant{
        slug: "empty-eduplaces-test",
        title: "Empty Eduplaces Test",
        eduplaces_id: ""
      }

      user = %User{
        name: "Test User",
        email: "test2@example.com"
      }

      assert {:ok, tenant} = Tenants.create_tenant(tenant, user)

      # Tenant should be created successfully and be active
      assert tenant = Tenants.get_tenant_by_slug(tenant.slug)
      assert tenant.state == :active
    end

    test "should create tenant with eduplaces_id and call external sync successfully" do
      tenant = %Tenant{
        slug: "with-eduplaces-test",
        title: "With Eduplaces Test",
        eduplaces_id: "test-eduplaces-id"
      }

      user = %User{
        name: "Test User",
        email: "test3@example.com"
      }

      # Mock successful sync
      Tesla.Mock.mock(fn
        %{url: "https://plausible.io/" <> _rest} = env ->
          %Tesla.Env{env | status: 200, body: "OK"}

        %{method: :post, url: "https://auth.sandbox.eduplaces.dev/oauth2/token"} ->
          %Tesla.Env{status: 200, body: %{"access_token" => "fake_token"}}

        %{url: "https://api.sandbox.eduplaces.dev/idm/ep/v1/" <> _path} ->
          %Tesla.Env{status: 200, body: %{"groups" => []}}
      end)

      assert {:ok, tenant} = Tenants.create_tenant(tenant, user)

      # Tenant should be created successfully and be active despite sync being called
      assert tenant = Tenants.get_tenant_by_slug(tenant.slug)
      assert tenant.state == :active
      assert tenant.eduplaces_id == "test-eduplaces-id"
    end

    test "should create tenant even when external sync fails with 404" do
      tenant = %Tenant{
        slug: "eduplaces-404-test",
        title: "Eduplaces 404 Test",
        eduplaces_id: "failing-eduplaces-id"
      }

      user = %User{
        name: "Test User",
        email: "test4@example.com"
      }

      # Mock failed sync (404)
      Tesla.Mock.mock(fn
        %{url: "https://plausible.io/" <> _rest} = env ->
          %Tesla.Env{env | status: 200, body: "OK"}

        %{method: :post, url: "https://auth.sandbox.eduplaces.dev/oauth2/token"} ->
          %Tesla.Env{status: 200, body: %{"access_token" => "fake_token"}}

        %{url: "https://api.sandbox.eduplaces.dev/idm/ep/v1/" <> _path} ->
          %Tesla.Env{status: 404, body: "Not Found"}
      end)

      assert {:ok, tenant} = Tenants.create_tenant(tenant, user)

      # Tenant should be created successfully and be active despite sync failure
      assert tenant = Tenants.get_tenant_by_slug(tenant.slug)
      assert tenant.state == :active
      assert tenant.eduplaces_id == "failing-eduplaces-id"
    end

    test "should create tenant even when external sync task crashes" do
      tenant = %Tenant{
        slug: "eduplaces-crash-test",
        title: "Eduplaces Crash Test",
        eduplaces_id: "crashing-eduplaces-id"
      }

      user = %User{
        name: "Test User",
        email: "test5@example.com"
      }

      # Mock crash scenario - return invalid response that will cause decode error
      Tesla.Mock.mock(fn
        %{url: "https://plausible.io/" <> _rest} = env ->
          %Tesla.Env{env | status: 200, body: "OK"}

        %{method: :post, url: "https://auth.sandbox.eduplaces.dev/oauth2/token"} ->
          %Tesla.Env{status: 200, body: %{"access_token" => "fake_token"}}

        %{url: "https://api.sandbox.eduplaces.dev/idm/ep/v1/" <> _path} ->
          # Return malformed response that will cause a crash
          %Tesla.Env{status: 200, body: "invalid json"}
      end)

      assert {:ok, tenant} = Tenants.create_tenant(tenant, user)

      # Tenant should be created successfully and be active despite sync crash
      assert tenant = Tenants.get_tenant_by_slug(tenant.slug)
      assert tenant.state == :active
      assert tenant.eduplaces_id == "crashing-eduplaces-id"
    end
  end
end
