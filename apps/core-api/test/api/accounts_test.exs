defmodule Api.AccountsTest do
  @moduledoc false

  use Api.DataCase
  use Bamboo.Test

  alias Api.Fixtures
  alias Api.Accounts
  alias Api.Accounts.User

  describe "users" do
    test "list_users/0 returns all users" do
      user_group = Fixtures.fixture(:user_group)
      groups = [user_group]
      user = Fixtures.fixture(:registered_user)

      user =
        user
        |> Repo.preload(:groups)
        |> Ecto.Changeset.change()
        |> put_assoc(:groups, groups)
        |> Repo.update!()

      assert Enum.map(Accounts.list_users(), fn u -> u.id end) == [user.id]
    end

    test "get_user/1 returns the user with given id" do
      user = Fixtures.fixture(:registered_user)
      assert Accounts.get_user(user.id) == user
    end

    test "get_user/1 returns nil if the user does not exist" do
      assert is_nil(Accounts.get_user(0))
    end

    test "register_user/1 should normalize (email) input" do
      user =
        %{}
        |> Map.put(:name, "Ludwig van Beethoven")
        |> Map.put(:nickname, "Lulu")
        |> Map.put(:email, "DerLudwigVan@Beethoven.de   ")
        |> Map.put(:password, "musik123")
        |> Accounts.register_user()

      assert {:ok, %User{email: "DerLudwigVan@Beethoven.de"}} = user
    end

    test "register_user/1 with valid data creates a user" do
      assert {:ok, %User{} = user} = Accounts.register_user(Fixtures.fixture(:valid_user_attrs))
      assert user.email == "some@email.de"
      assert user.name == "Alberta Smith"
    end

    test "register_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} =
               Accounts.register_user(Fixtures.fixture(:invalid_user_attrs))
    end

    test "update_profile/2 with valid data updates the user" do
      user = Fixtures.fixture(:registered_user)

      assert {:ok, %User{name: "Alberta Smithers", nickname: "TheNewNick"}} =
               Accounts.update_profile(user, Fixtures.fixture(:updated_user_attrs))
    end

    test "update_profile/2 with invalid data returns error changeset" do
      user = Fixtures.fixture(:registered_user)

      assert {:error, %Ecto.Changeset{}} =
               Accounts.update_profile(user, Fixtures.fixture(:invalid_user_attrs))

      assert user == Accounts.get_user(user.id)
    end

    test "delete_user/1 deletes the user" do
      user = Fixtures.fixture(:registered_user)
      assert {:ok, %User{}} = Accounts.delete_user(user)
      assert is_nil(Accounts.get_user(user.id))
    end

    test "update_password/2 changes password and sends out notification" do
      {:ok, user} =
        Fixtures.fixture(:registered_user)
        |> Accounts.update_password("newpass")

      assert Argon2.verify_pass("newpass", user.password_hash)

      assert_delivered_email(Api.Email.password_changed_mail(user))
    end
  end

  describe "files" do
    test "delete_file/1 should delete file" do
      user = Fixtures.fixture(:registered_user)
      file = Fixtures.fixture(:file, user)

      Accounts.delete_file(file)

      assert_raise Ecto.NoResultsError, fn ->
        Api.Repo.get!(Accounts.File, file.id)
      end
    end
  end
end
