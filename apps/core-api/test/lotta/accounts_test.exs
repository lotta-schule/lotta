defmodule Lotta.AccountsTest do
  @moduledoc false

  use Lotta.DataCase
  use Bamboo.Test

  alias Lotta.{Accounts, Email, Fixtures, Tenants, Repo}
  alias Lotta.Eduplaces.UserInfo
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

    test "register_user_by_mail/1 should normalize (email) input", %{tenant: t} do
      user_params = %{
        name: "Ludwig van Beethoven",
        nickname: "Lulu",
        email: "DerLudwigVan@Beethoven.de   "
      }

      assert {:ok, %User{email: "DerLudwigVan@Beethoven.de"}} =
               Accounts.register_user_by_mail(t, user_params)
    end

    test "register_user_by_mail/1 with valid data creates a user with a password", %{tenant: t} do
      assert {:ok, %User{} = user} =
               Accounts.register_user_by_mail(t, Fixtures.fixture(:valid_user_attrs))

      assert user.email == "some@email.de"
      assert user.name == "Alberta Smith"
      refute is_nil(user.password)
      assert Accounts.Authentication.verify_user_pass(user, user.password)
    end

    test "register_user_by_mail/1 with invalid data returns error changeset", %{tenant: t} do
      assert {:error, %Ecto.Changeset{}} =
               Accounts.register_user_by_mail(t, Fixtures.fixture(:invalid_user_attrs))
    end

    test "get_or_create_eduplaces_user/1 should create as well as find a user by its eduplaces_id",
         %{tenant: tenant} do
      eduplaces_id = "eduplaces-this-is-user1-12345"

      created_user =
        Fixtures.fixture(:registered_eduplace_user, %{eduplaces_id: eduplaces_id})

      assert {:ok, %User{eduplaces_id: ^eduplaces_id}} =
               Accounts.get_or_create_eduplaces_user(tenant, %UserInfo{id: eduplaces_id})

      assert created_user.eduplaces_id == eduplaces_id

      {:ok, retrieved_user} =
        Accounts.get_or_create_eduplaces_user(tenant, %UserInfo{id: eduplaces_id})

      assert %User{eduplaces_id: ^eduplaces_id} = retrieved_user
      assert retrieved_user.id == created_user.id
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
          platform_id: "ios/123-123-123",
          device_type: "phone",
          model_name: "iphone16,1",
          push_token: "apns/abcdefgh"
        })

      assert {:ok, %UserDevice{platform_id: "ios/123-123-123"}} = res
    end

    test "it should perform an upsert when inserting a device that already exists" do
      email = List.first(@all_users)
      user = Accounts.get_user_by_email(email)

      # First insert should work no problem
      assert {:ok,
              %UserDevice{
                id: id,
                platform_id: "ios/123-456-789",
                push_token: "apns/dadada"
              }} =
               Accounts.register_device(
                 user,
                 %{
                   custom_name: "Test",
                   platform_id: "ios/123-456-789",
                   device_type: "phone",
                   model_name: "iphone16,1",
                   push_token: "apns/dadada"
                 }
               )

      assert {:ok,
              %UserDevice{
                id: ^id,
                platform_id: "ios/123-456-789"
              }} =
               Accounts.register_device(
                 user,
                 %{
                   platform_id: "ios/123-456-789",
                   device_type: "phone",
                   model_name: "iphone16,1",
                   push_token: "apns/dadada"
                 }
               )
    end

    test "it should update a UserDevice" do
      email = List.first(@all_users)
      user = Accounts.get_user_by_email(email)

      assert {:ok, device} =
               Accounts.register_device(user, %{
                 custom_name: "Test",
                 platform_id: "ios/123-123-123",
                 device_type: "phone",
                 model_name: "iphone16,1",
                 push_token: "apns/abcdefgh"
               })

      assert {:ok,
              %UserDevice{
                custom_name: "My Device",
                platform_id: "ios/123-123-123",
                device_type: "desktop",
                push_token: nil
              }} =
               Accounts.update_device(device, %{
                 custom_name: "My Device",
                 device_type: "desktop",
                 push_token: nil
               })
    end
  end
end
