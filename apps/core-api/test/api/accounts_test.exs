defmodule Api.AccountsTest do
  @moduledoc false

  use Api.DataCase
  use Bamboo.Test

  alias Api.Fixtures
  alias Api.Accounts
  alias Api.Accounts.User

  @all_users [
    "alexis.rinaldoni@einsa.net",
    "alexis.rinaldoni@lotta.schule",
    "billy@lotta.schule",
    "eike.wiewiorra@lotta.schule",
    "drevil@lotta.schule",
    "maxi@lotta.schule",
    "doro@lotta.schule",
    "mcurie@lotta.schule"
  ]
  describe "users" do
    test "list_users/0 returns all users" do
      assert Enum.all?(
               Accounts.list_users(),
               fn %{email: email} ->
                 Enum.member?(@all_users, email)
               end
             )
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

      assert {:ok, %User{email: "DerLudwigVan@Beethoven.de"}, _password} = user
    end

    test "register_user/1 with valid data creates a user with a password" do
      assert {:ok, %User{} = user, password} =
               Accounts.register_user(Fixtures.fixture(:valid_user_attrs))

      assert user.email == "some@email.de"
      assert user.name == "Alberta Smith"
      refute is_nil(password)
      assert Api.Accounts.Authentication.verify_user_pass(user, password)
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
end
