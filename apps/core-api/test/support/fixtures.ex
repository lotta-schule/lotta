defmodule Api.Fixtures do
  @moduledoc false
  alias Api.Repo
  alias Api.Tenants.{Tenant, Category}
  alias Api.Accounts.{User, File}
  alias Api.Content.{Article}

  # Tenant

  def fixture(:valid_tenant_attrs) do
    %{
      id: 1,
      slug: "test",
      title: "Test Tenant"
    }
  end

  def fixture(:tenant) do
    {:ok, tenant} =
      Tenant
      |> struct(fixture(:valid_tenant_attrs))
      |> Repo.insert(on_conflict: :nothing)

    tenant
  end

  def fixture(:valid_category_attrs) do
    %{
      title: "Meine Kategorie",
      sort_key: 10,
      is_sidenav: false,
      is_homepage: false,
      hide_articles_from_homepage: false,
      tenant_id: fixture(:tenant).id
    }
  end

  def fixture(:category) do
    {:ok, category} =
      Category
      |> struct(fixture(:valid_category_attrs))
      |> Repo.insert(on_conflict: :nothing)

    category
  end

  # Account

  def fixture(:valid_user_group_attrs, is_admin_group: is_admin_group) do
    %{
      name: "Meine Gruppe",
      sort_key: if(is_admin_group, do: 1000, else: 500),
      is_admin_group: is_admin_group
    }
  end

  def fixture(:user_group, is_admin_group: true) do
    {:ok, group} =
      fixture(:tenant)
      |> Ecto.build_assoc(:groups, fixture(:valid_user_group_attrs, is_admin_group: true))
      |> Repo.insert()

    group
  end

  def fixture(:user_group) do
    {:ok, group} =
      fixture(:tenant)
      |> Ecto.build_assoc(:groups, fixture(:valid_user_group_attrs, is_admin_group: false))
      |> Repo.insert()

    group
  end

  def fixture(:valid_user_attrs) do
    %{
      email: "some@email.de",
      name: "Alberta Smith",
      nickname: "TheNick",
      class: "5",
      password: "password",
      tenant_id: fixture(:tenant).id
    }
  end

  def fixture(:valid_admin_attrs) do
    %{
      email: "meineschule@lotta.schule",
      name: "Admin Didang",
      nickname: "TheAdmin",
      class: "Wie",
      password: "password",
      tenant_id: fixture(:tenant).id
    }
  end

  def fixture(:updated_user_attrs) do
    %{
      email: "some email",
      name: "Alberta Smithers",
      nickname: "TheNewNick",
      class: "6"
    }
  end

  def fixture(:invalid_user_attrs) do
    %{
      email: nil,
      name: nil,
      nickname: nil
    }
  end

  def fixture(:registered_user) do
    {:ok, user} =
      User
      |> struct(fixture(:valid_user_attrs))
      |> Repo.insert()

    Repo.get(User, user.id)
  end

  def fixture(:admin_user) do
    {:ok, user} =
      User
      |> struct(fixture(:valid_admin_attrs))
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:groups, [fixture(:user_group, is_admin_group: true)])
      |> Repo.insert()

    Repo.get(User, user.id)
  end

  def fixture(:valid_file_attrs) do
    %{
      file_type: "some_file_type",
      filename: "some_filename",
      filesize: 42,
      mime_type: "some_mime_type",
      remote_location: "some_remote_location",
      tenant_id: fixture(:tenant).id
    }
  end

  def fixture(:invalid_file_attrs) do
    %{
      file_type: nil,
      filename: nil,
      filesize: 0
    }
  end

  def fixture(:file, user) do
    {:ok, file} =
      File
      |> struct(fixture(:valid_file_attrs))
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:user, user)
      |> Repo.insert()

    Repo.get!(File, file.id)
  end

  # Content

  def fixture(:valid_article_attrs) do
    %{
      title: "Mein Artikel",
      preview: "Kleine Artikel-Vorschau",
      topic: "Mein Thema",
      ready_to_publish: true,
      is_pinned_to_top: false,
      tenant_id: fixture(:tenant).id,
      category: fixture(:category)
    }
  end

  def fixture(:article, %User{} = user) do
    {:ok, article} =
      Article
      |> struct(fixture(:valid_article_attrs))
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:users, [user])
      |> Repo.insert(on_conflict: :nothing)

    article
  end

  def fixture(:unpublished_article, %User{} = user) do
    {:ok, article} =
      Article
      |> struct(fixture(:valid_article_attrs))
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:users, [user])
      |> Ecto.Changeset.put_assoc(:category, nil)
      |> Repo.insert(on_conflict: :nothing)

    article
  end
end
