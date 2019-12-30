defmodule Api.AccountsTest do
  use Api.DataCase
  alias Api.Fixtures
  alias Api.Accounts
  alias Api.Accounts.UserGroup

  
  describe "users" do
    alias Api.Accounts.User

    test "list_users_with_groups/1 returns the users of a given tenant with groups" do
      user_group =
        Fixtures.fixture(:user_group)
        |> Repo.preload(:tenant)
      groups = Repo.all(from g in UserGroup, where: g.tenant_id != ^user_group.tenant_id) ++ [user_group]
      user = Fixtures.fixture(:registered_user)
      user = user
      |> Repo.preload(:groups)
      |> Ecto.Changeset.change
      |> put_assoc(:groups, groups)
      |> Repo.update!

      assert Enum.map(Accounts.list_users_with_groups(user_group.tenant.id), fn u -> u.id end) == [user.id]
    end

    test "get_user!/1 returns the user with given id" do
      user = Fixtures.fixture(:registered_user)
      assert Accounts.get_user!(user.id) == user
    end

    test "create_user/1 with valid data creates a user" do
      assert {:ok, %User{} = user} = Accounts.create_user(Fixtures.fixture(:valid_user_attrs))
      assert user.email == "some@email.de"
      assert user.name == "Alberta Smith"
    end

    test "create_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_user(Fixtures.fixture(:invalid_user_attrs))
    end

    test "update_user/2 with valid data updates the user" do
      user =
        Fixtures.fixture(:registered_user)
        |> Repo.preload(:avatar_image_file)
      assert {:ok, %User{} = user} = Accounts.update_user(user, Fixtures.fixture(:updated_user_attrs))
      assert user.name == "Alberta Smithers"
      assert user.nickname == "TheNewNick"
    end

    test "update_user/2 with invalid data returns error changeset" do
      user = Fixtures.fixture(:registered_user)
      assert {:error, %Ecto.Changeset{}} = Accounts.update_user(user, Fixtures.fixture(:invalid_user_attrs))
      assert user == Accounts.get_user!(user.id)
    end

    test "delete_user/1 deletes the user" do
      user = Fixtures.fixture(:registered_user)
      assert {:ok, %User{}} = Accounts.delete_user(user)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_user!(user.id) end
    end

    test "change_user/1 returns a user changeset" do
      user = Fixtures.fixture(:registered_user)
      assert %Ecto.Changeset{} = Accounts.change_user(user)
    end
  end

  describe "files" do
    alias Api.Accounts.File

    test "get_valid_path should return valid paths" do
      assert File.get_valid_path("//a/b/") == "/a/b"
      assert File.get_valid_path("mein//test/") == "/mein/test"
      assert File.get_valid_path("") == "/"
      assert File.get_valid_path("/////ich////sollte/viele///striche//vereinheitlichen") == "/ich/sollte/viele/striche/vereinheitlichen"
    end

    test "delete_file/1 should delete file" do
      user = Fixtures.fixture(:registered_user)
      file = Fixtures.fixture(:file, user)
      
      Accounts.delete_file(file)

      assert_raise Ecto.NoResultsError, fn ->
        Api.Repo.get!(Accounts.File, file.id)
      end
    end

    test "move_file/1 should change a file's path" do
      # user = Fixtures.fixture(:registered_user)
      file = Fixtures.fixture(:file, nil)
      Accounts.move_file(file, %{path: "/a/new/path"})

      assert Accounts.get_file!(file.id).path == "/a/new/path"
    end
  end
end