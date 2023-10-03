defmodule Lotta.AccountsTest do
  @moduledoc false

  use Lotta.DataCase
  use Bamboo.Test

  alias Lotta.{Accounts, Email, Fixtures, Tenants, Repo}
  alias Lotta.Accounts.{User, UserDevice}

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
  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)

    {:ok,
     %{
       tenant: Tenants.get_tenant_by_prefix(@prefix)
     }}
  end

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

    test "register_user/1 should normalize (email) input", %{tenant: t} do
      user_params = %{
        name: "Ludwig van Beethoven",
        nickname: "Lulu",
        email: "DerLudwigVan@Beethoven.de   ",
        password: "musik123"
      }

      user = Accounts.register_user(t, user_params)

      assert {:ok, %User{email: "DerLudwigVan@Beethoven.de"}, _password} = user
    end

    test "register_user/1 with valid data creates a user with a password", %{tenant: t} do
      assert {:ok, %User{} = user, password} =
               Accounts.register_user(t, Fixtures.fixture(:valid_user_attrs))

      assert user.email == "some@email.de"
      assert user.name == "Alberta Smith"
      refute is_nil(password)
      assert Accounts.Authentication.verify_user_pass(user, password)
    end

    test "register_user/1 with invalid data returns error changeset", %{tenant: t} do
      assert {:error, %Ecto.Changeset{}} =
               Accounts.register_user(t, Fixtures.fixture(:invalid_user_attrs))
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

      assert_delivered_email(Email.account_closed_mail(user))
    end

    test "update_password/2 changes password and sends out notification" do
      {:ok, user} =
        Fixtures.fixture(:registered_user)
        |> Accounts.update_password("newpass")

      assert Argon2.verify_pass("newpass", user.password_hash)

      assert_delivered_email(Email.password_changed_mail(user))
    end
  end

  describe "user_tokens" do
    test "it should add a device for a user" do
      email = List.first(@all_users)
      user = Accounts.get_user_by_email(email)

      res =
        Accounts.register_device(user, %{
          custom_name: "Test",
          platform: "ios",
          device_type: "phone",
          model_name: "iphone16,1",
          push_token: "abcdefgh",
          push_token_type: "apns"
        })

      assert {:ok, %UserDevice{platform: "ios"}} = res
    end

    test "it should get an error adding a device with push_token, without push_token_type" do
      email = List.first(@all_users)
      user = Accounts.get_user_by_email(email)

      res =
        Accounts.register_device(user, %{
          custom_name: "Test",
          platform: "ios",
          device_type: "phone",
          model_name: "iphone16,1",
          push_token: "abcdefgh"
        })

      assert {:error, %Ecto.Changeset{}} = res
    end

    test "it should delete any push_token of any UserDevice in other tenants" do
      email = List.first(@all_users)

      tenants = [
        Tenants.get_tenant_by_prefix(@prefix),
        Tenants.get_tenant_by_prefix("#{@prefix}2")
      ]

      [result1, result2] =
        tenants
        |> Enum.map(fn %{prefix: prefix} ->
          user = Repo.get_by!(User, [email: email], prefix: prefix)

          {:ok, %{id: id}} =
            Accounts.register_device(
              user,
              %{
                custom_name: "Test",
                platform: "ios",
                device_type: "phone",
                model_name: "iphone16,1",
                push_token: "abcdefghijklmnoprqst",
                push_token_type: "apns"
              },
              prefix: prefix
            )

          {prefix, id}
        end)

      # Second Userdevice should be set ok
      assert %UserDevice{push_token: "abcdefghijklmnoprqst"} =
               Repo.get!(UserDevice, elem(result2, 1), prefix: elem(result2, 0))

      assert %UserDevice{push_token: nil} =
               Repo.get!(UserDevice, elem(result1, 1), prefix: elem(result1, 0))
    end

    test "it should update a UserDevice, resetting push_token_type when push_token is set to nil" do
      email = List.first(@all_users)
      user = Accounts.get_user_by_email(email)

      assert {:ok, device} =
               Accounts.register_device(user, %{
                 custom_name: "Test",
                 platform: "ios",
                 device_type: "phone",
                 model_name: "iphone16,1",
                 push_token: "abcdefgh",
                 push_token_type: "apns"
               })

      assert {:ok,
              %UserDevice{
                custom_name: "My Device",
                platform: "ios",
                device_type: "desktop",
                push_token: nil,
                push_token_type: nil
              }} =
               Accounts.update_device(device, %{
                 custom_name: "My Device",
                 device_type: "desktop",
                 push_token: nil
               })
    end
  end
end
