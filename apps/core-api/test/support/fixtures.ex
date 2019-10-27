defmodule Api.Fixtures do
  alias Api.Repo
  alias Api.Accounts
  alias Api.Tenants.{Tenant}
  alias Api.Accounts.{User, UserGroup}

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
  
  def fixture(:valid_user_group_attrs, [is_admin_group: is_admin_group]) do
    %{
      name: "Meine Gruppe",
      priority: (if is_admin_group, do: 1000, else: 500),
      is_admin_group: is_admin_group
    }
  end

  def fixture(:user_group, [is_admin_group: true]) do
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

  def fixture(:valid_file_attrs) do
    %{
      file_type: "some_file_type",
      filename: "some_filename",
      filesize: 42,
      mime_type: "some_mime_type",
      path: "some_path",
      remote_location: "some_remote_location"
    }
  end
  
  def fixture(:invalid_file_attrs) do
    %{
      file_type: nil,
      filename: nil,
      filesize: 0
    }
  end

  def fixture(:file) do
    {:ok, file} = Accounts.create_file(fixture(:valid_file_attrs))
    file
  end
end