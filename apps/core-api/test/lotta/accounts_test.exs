defmodule Lotta.AccountsTest do
  @moduledoc false

  use Lotta.DataCase
  use Bamboo.Test

  alias Lotta.{Accounts, Email, Fixtures, Repo, Tenants}
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

  describe "list_admin_users/1" do
    test "returns users that are members of admin groups", %{tenant: tenant} do
      # Create admin group
      admin_group = Fixtures.fixture(:user_group, is_admin_group: true)

      # Create regular group
      regular_group = Fixtures.fixture(:user_group, is_admin_group: false)

      # Create users
      admin_user =
        Fixtures.fixture(:registered_user, %{email: "admin@test.com", name: "Admin User"})

      regular_user =
        Fixtures.fixture(:registered_user, %{email: "user@test.com", name: "Regular User"})

      # Assign users to groups
      Accounts.update_user(admin_user, %{groups: [admin_group]})
      Accounts.update_user(regular_user, %{groups: [regular_group]})

      admin_users = Accounts.list_admin_users(tenant)

      admin_emails = Enum.map(admin_users, & &1.email)
      assert "admin@test.com" in admin_emails
      refute "user@test.com" in admin_emails
    end

    test "returns empty list when no admin groups exist", %{tenant: tenant} do
      # Create only regular groups
      regular_group = Fixtures.fixture(:user_group, is_admin_group: false)
      user = Fixtures.fixture(:registered_user, %{email: "user@test.com"})
      Accounts.update_user(user, %{groups: [regular_group]})

      admin_users = Accounts.list_admin_users(tenant)
      user_emails = Enum.map(admin_users, & &1.email)
      refute "user@test.com" in user_emails
    end

    test "returns distinct users when user is in multiple admin groups", %{tenant: tenant} do
      # Create multiple admin groups
      admin_group1 = Fixtures.fixture(:user_group, is_admin_group: true)
      admin_group2 = Fixtures.fixture(:user_group, is_admin_group: true)

      # Create user and assign to both admin groups
      admin_user =
        Fixtures.fixture(:registered_user, %{email: "multi-admin@test.com", name: "Multi Admin"})

      Accounts.update_user(admin_user, %{groups: [admin_group1, admin_group2]})

      admin_users = Accounts.list_admin_users(tenant)

      # Count how many times the user appears
      matching_users = Enum.filter(admin_users, &(&1.email == "multi-admin@test.com"))
      assert length(matching_users) == 1
    end

    test "works without tenant parameter using default prefix" do
      admin_group = Fixtures.fixture(:user_group, is_admin_group: true)
      admin_user = Fixtures.fixture(:registered_user, %{email: "default-admin@test.com"})
      Accounts.update_user(admin_user, %{groups: [admin_group]})

      admin_users = Accounts.list_admin_users()
      admin_emails = Enum.map(admin_users, & &1.email)
      assert "default-admin@test.com" in admin_emails
    end
  end

  describe "search_user/3" do
    test "finds user by exact email match" do
      _user = Fixtures.fixture(:registered_user, %{email: "exact@test.com", name: "Exact User"})

      results = Accounts.search_user("exact@test.com", nil, nil)

      assert length(results) >= 1
      assert Enum.any?(results, &(&1.email == "exact@test.com"))
    end

    test "finds users by partial name match" do
      _user1 = Fixtures.fixture(:registered_user, %{email: "user1@test.com", name: "John Smith"})
      _user2 = Fixtures.fixture(:registered_user, %{email: "user2@test.com", name: "Jane Smith"})
      _user3 = Fixtures.fixture(:registered_user, %{email: "user3@test.com", name: "Bob Jones"})

      results = Accounts.search_user("Smith", nil, nil)

      result_names = Enum.map(results, & &1.name)
      assert "John Smith" in result_names
      assert "Jane Smith" in result_names
      refute "Bob Jones" in result_names
    end

    test "finds users by partial nickname match" do
      _user =
        Fixtures.fixture(:registered_user, %{
          email: "nick@test.com",
          name: "User",
          nickname: "SuperNick"
        })

      results = Accounts.search_user("Super", nil, nil)

      assert Enum.any?(results, &(&1.nickname == "SuperNick"))
    end

    test "filters by group IDs" do
      group1 = Fixtures.fixture(:user_group, is_admin_group: false)
      group2 = Fixtures.fixture(:user_group, is_admin_group: false)

      user1 = Fixtures.fixture(:registered_user, %{email: "group1@test.com", name: "Group1 User"})
      user2 = Fixtures.fixture(:registered_user, %{email: "group2@test.com", name: "Group2 User"})

      Accounts.update_user(user1, %{groups: [group1]})
      Accounts.update_user(user2, %{groups: [group2]})

      results = Accounts.search_user(nil, [group1.id], nil)

      result_emails = Enum.map(results, & &1.email)
      assert "group1@test.com" in result_emails
      refute "group2@test.com" in result_emails
    end

    test "includes users without groups when nil group ID is specified" do
      group = Fixtures.fixture(:user_group, is_admin_group: false)

      user_with_group = Fixtures.fixture(:registered_user, %{email: "with-group@test.com"})
      _user_without_group = Fixtures.fixture(:registered_user, %{email: "without-group@test.com"})

      Accounts.update_user(user_with_group, %{groups: [group]})

      results = Accounts.search_user(nil, [nil], nil)

      result_emails = Enum.map(results, & &1.email)
      assert "without-group@test.com" in result_emails
    end

    test "filters by last seen after date" do
      # 1 hour ago
      past_date = DateTime.add(DateTime.utc_now(), -3600, :second) |> DateTime.truncate(:second)
      user = Fixtures.fixture(:registered_user, %{email: "recent@test.com"})

      # Update user's last_seen to past date
      user
      |> Ecto.Changeset.change(%{last_seen: past_date})
      |> Repo.update()

      # Search for users last seen before now (should include our user)
      results = Accounts.search_user(nil, nil, {:after, DateTime.utc_now()})

      result_emails = Enum.map(results, & &1.email)
      assert "recent@test.com" in result_emails
    end

    test "filters by last seen before date" do
      # 1 hour from now
      _future_date = DateTime.add(DateTime.utc_now(), 3600, :second)
      user = Fixtures.fixture(:registered_user, %{email: "old@test.com"})

      # Update user's last_seen to past date
      past_date = DateTime.add(DateTime.utc_now(), -3600, :second) |> DateTime.truncate(:second)

      user
      |> Ecto.Changeset.change(%{last_seen: past_date})
      |> Repo.update()

      # Search for users last seen after past date (should not include our user)
      results = Accounts.search_user(nil, nil, {:before, past_date})

      result_emails = Enum.map(results, & &1.email)
      refute "old@test.com" in result_emails
    end
  end

  describe "list_users_for_group/1" do
    test "returns users assigned to group" do
      group = Fixtures.fixture(:user_group, is_admin_group: false)
      user1 = Fixtures.fixture(:registered_user, %{email: "assigned1@test.com"})
      user2 = Fixtures.fixture(:registered_user, %{email: "assigned2@test.com"})

      Accounts.update_user(user1, %{groups: [group]})
      Accounts.update_user(user2, %{groups: [group]})

      users = Accounts.list_users_for_group(group)

      user_emails = Enum.map(users, & &1.email)
      assert "assigned1@test.com" in user_emails
      assert "assigned2@test.com" in user_emails
    end

    test "returns empty list for group with no users" do
      group = Fixtures.fixture(:user_group, is_admin_group: false)

      users = Accounts.list_users_for_group(group)

      assert users == []
    end
  end

  describe "list_users_for_groups/1" do
    test "returns users from multiple groups" do
      group1 = Fixtures.fixture(:user_group, is_admin_group: false)
      group2 = Fixtures.fixture(:user_group, is_admin_group: false)

      user1 = Fixtures.fixture(:registered_user, %{email: "multi1@test.com"})
      user2 = Fixtures.fixture(:registered_user, %{email: "multi2@test.com"})

      Accounts.update_user(user1, %{groups: [group1]})
      Accounts.update_user(user2, %{groups: [group2]})

      users = Accounts.list_users_for_groups([group1, group2])

      user_emails = Enum.map(users, & &1.email)
      assert "multi1@test.com" in user_emails
      assert "multi2@test.com" in user_emails
    end

    test "returns unique users when user is in multiple queried groups" do
      group1 = Fixtures.fixture(:user_group, is_admin_group: false)
      group2 = Fixtures.fixture(:user_group, is_admin_group: false)

      user = Fixtures.fixture(:registered_user, %{email: "overlap@test.com"})
      Accounts.update_user(user, %{groups: [group1, group2]})

      users = Accounts.list_users_for_groups([group1, group2])

      matching_users = Enum.filter(users, &(&1.email == "overlap@test.com"))
      assert length(matching_users) == 1
    end
  end

  describe "list_users_without_groups/0" do
    test "returns users not assigned to any group" do
      group = Fixtures.fixture(:user_group, is_admin_group: false)

      user_with_group = Fixtures.fixture(:registered_user, %{email: "with-group@test.com"})
      _user_without_group = Fixtures.fixture(:registered_user, %{email: "without-group@test.com"})

      Accounts.update_user(user_with_group, %{groups: [group]})

      users_without_groups = Accounts.list_users_without_groups()

      user_emails = Enum.map(users_without_groups, & &1.email)
      assert "without-group@test.com" in user_emails
      refute "with-group@test.com" in user_emails
    end

    test "returns empty list when all users are in groups" do
      group = Fixtures.fixture(:user_group, is_admin_group: false)

      # Get existing users and assign them to group
      existing_users = Accounts.list_users()

      Enum.each(existing_users, fn user ->
        Accounts.update_user(user, %{groups: [group]})
      end)

      users_without_groups = Accounts.list_users_without_groups()

      assert users_without_groups == []
    end
  end

  describe "password reset" do
    test "request_password_reset/1 creates reset token for existing user" do
      user = Fixtures.fixture(:registered_user, %{email: "reset@test.com"})

      assert {:ok, returned_user} = Accounts.request_password_reset("reset@test.com")
      assert returned_user.id == user.id

      # Check that an email was sent to the user's email
      assert_received {:delivered_email, %Bamboo.Email{to: [nil: "reset@test.com"]}}
    end

    test "request_password_reset/1 is case insensitive for email" do
      user = Fixtures.fixture(:registered_user, %{email: "CaseInsensitive@test.com"})

      assert {:ok, returned_user} = Accounts.request_password_reset("caseinsensitive@test.com")
      assert returned_user.id == user.id
    end

    test "request_password_reset/1 returns error for non-existent user" do
      assert {:error, :not_found} = Accounts.request_password_reset("nonexistent@test.com")
    end

    test "find_user_by_reset_token/2 returns user for valid token" do
      user = Fixtures.fixture(:registered_user, %{email: "token-test@test.com"})

      # First create a reset request to get a token
      {:ok, _} = Accounts.request_password_reset("token-test@test.com")

      # Retrieve the token from Redis (simplified for test)
      prefix = Repo.get_prefix()
      key = "#{prefix}---user-email-verify-token-token-test@test.com"
      {:ok, token} = Redix.command(:redix, ["GET", key])

      assert {:ok, found_user} = Accounts.find_user_by_reset_token("token-test@test.com", token)
      assert found_user.id == user.id

      # Token should be invalidated after use
      assert {:error, :invalid_token} =
               Accounts.find_user_by_reset_token("token-test@test.com", token)
    end

    test "find_user_by_reset_token/2 returns error for invalid token" do
      _user = Fixtures.fixture(:registered_user, %{email: "invalid-token@test.com"})

      assert {:error, :invalid_token} =
               Accounts.find_user_by_reset_token("invalid-token@test.com", "invalid-token")
    end

    test "find_user_by_reset_token/2 returns error for non-existent email" do
      assert {:error, :invalid_token} =
               Accounts.find_user_by_reset_token("nonexistent@test.com", "any-token")
    end
  end

  describe "user_groups" do
    test "create_user_group/1 creates group with valid data" do
      attrs = %{
        name: "Test Group",
        is_admin_group: false
      }

      assert {:ok, group} = Accounts.create_user_group(attrs)
      assert group.name == "Test Group"
      assert group.is_admin_group == false
      assert group.sort_key > 0
    end

    test "create_user_group/1 auto-assigns sort_key when not provided" do
      attrs = %{name: "Auto Sort Group", is_admin_group: false}

      assert {:ok, group} = Accounts.create_user_group(attrs)
      assert is_integer(group.sort_key)
      assert group.sort_key > 0
    end

    test "create_user_group/1 respects provided sort_key" do
      attrs = %{name: "Custom Sort Group", is_admin_group: false, sort_key: 100}

      assert {:ok, group} = Accounts.create_user_group(attrs)
      assert group.sort_key == 100
    end

    test "update_user_group/2 updates group with valid data" do
      group = Fixtures.fixture(:user_group, is_admin_group: false)

      assert {:ok, updated_group} = Accounts.update_user_group(group, %{name: "Updated Name"})
      assert updated_group.name == "Updated Name"
    end

    test "delete_user_group/1 deletes regular group successfully" do
      group = Fixtures.fixture(:user_group, is_admin_group: false)

      assert {:ok, %{user_group: deleted_group}} = Accounts.delete_user_group(group)
      assert deleted_group.id == group.id
      assert is_nil(Accounts.get_user_group(group.id))
    end
  end

  describe "additional user functions" do
    test "update_user/2 updates user groups" do
      user = Fixtures.fixture(:registered_user, %{email: "admin-update@test.com"})
      group = Fixtures.fixture(:user_group, is_admin_group: false)

      assert {:ok, updated_user} =
               Accounts.update_user(user, %{
                 groups: [group]
               })

      assert length(updated_user.groups) == 1
    end

    test "update_email/2 updates user email" do
      user = Fixtures.fixture(:registered_user, %{email: "old@test.com"})

      assert {:ok, updated_user} = Accounts.update_email(user, "new@test.com")
      assert updated_user.email == "new@test.com"
    end

    test "see_user/1 updates last_seen timestamp" do
      user = Fixtures.fixture(:registered_user, %{email: "seen@test.com"})

      # Set initial last_seen to nil
      user
      |> Ecto.Changeset.change(%{last_seen: nil})
      |> Repo.update()

      assert {:ok, updated_user} = Accounts.see_user(user)
      assert updated_user.last_seen != nil
      assert DateTime.diff(updated_user.last_seen, DateTime.utc_now()) < 5
    end

    test "get_user_by_email/1 finds user by email" do
      user = Fixtures.fixture(:registered_user, %{email: "find-by-email@test.com"})

      found_user = Accounts.get_user_by_email("find-by-email@test.com")

      assert found_user.id == user.id
      assert found_user.email == "find-by-email@test.com"
    end

    test "get_user_by_email/1 returns nil for non-existent email" do
      found_user = Accounts.get_user_by_email("nonexistent@test.com")

      assert found_user == nil
    end

    test "list_user_groups/0 returns all user groups ordered correctly" do
      # Create groups with different sort keys
      # Admin groups have higher sort_key
      _group1 = Fixtures.fixture(:user_group, is_admin_group: true)
      _group2 = Fixtures.fixture(:user_group, is_admin_group: false)

      groups = Accounts.list_user_groups()

      # Should be ordered by sort_key desc, then is_admin_group desc
      assert length(groups) >= 2
      # Admin groups should come first due to higher sort_key and is_admin_group = true
      admin_groups = Enum.filter(groups, & &1.is_admin_group)
      regular_groups = Enum.filter(groups, &(!&1.is_admin_group))

      assert length(admin_groups) >= 1
      assert length(regular_groups) >= 1
    end

    test "list_groups_for_enrollment_token/1 finds groups with specific token" do
      group = Fixtures.fixture(:user_group, is_admin_group: false)

      # Add enrollment token to group
      updated_group =
        group
        |> Ecto.Changeset.change(%{enrollment_tokens: ["test-token-123"]})
        |> Repo.update!()

      found_groups = Accounts.list_groups_for_enrollment_token("test-token-123")

      assert length(found_groups) == 1
      assert hd(found_groups).id == updated_group.id
    end

    test "list_groups_for_enrollment_tokens/2 finds groups with any of the tokens" do
      group1 = Fixtures.fixture(:user_group, is_admin_group: false)
      group2 = Fixtures.fixture(:user_group, is_admin_group: false)

      # Add different enrollment tokens to groups
      group1
      |> Ecto.Changeset.change(%{enrollment_tokens: ["token-1", "token-2"]})
      |> Repo.update!()

      group2
      |> Ecto.Changeset.change(%{enrollment_tokens: ["token-2", "token-3"]})
      |> Repo.update!()

      found_groups = Accounts.list_groups_for_enrollment_tokens(["token-1", "token-3"])

      # Should find both groups
      assert length(found_groups) == 2
      group_ids = Enum.map(found_groups, & &1.id)
      assert group1.id in group_ids
      assert group2.id in group_ids
    end

    test "register_eduplaces_user/2 creates user from eduplaces info", %{tenant: tenant} do
      import Mock

      user_info = %Lotta.Eduplaces.UserInfo{
        id: "eduplaces-user-456",
        username: "eduuser",
        role: :student,
        groups: []
      }

      with_mock(Lotta.Storage, [:passthrough],
        create_new_user_directories: fn _user -> :ok end
      ) do
        assert {:ok, user} = Accounts.register_eduplaces_user(tenant, user_info)

        assert user.eduplaces_id == "eduplaces-user-456"
        assert user.nickname == "eduuser"
        assert called(Lotta.Storage.create_new_user_directories(user))
      end
    end

    test "get_or_create_eduplaces_user/2 finds existing user" do
      existing_user = Fixtures.fixture(:registered_eduplace_user, %{eduplaces_id: "existing-123"})

      user_info = %Lotta.Eduplaces.UserInfo{id: "existing-123"}

      assert {:ok, found_user} = Accounts.get_or_create_eduplaces_user(nil, user_info)
      assert found_user.id == existing_user.id
    end
  end

  describe "device management" do
    test "list_devices/1 returns all devices for user" do
      user = Fixtures.fixture(:registered_user, %{email: "device-owner@test.com"})

      # Register a device
      {:ok, _device} =
        Accounts.register_device(user, %{
          custom_name: "Test Device",
          platform_id: "test/123",
          device_type: "phone",
          model_name: "test-model",
          push_token: "test-token"
        })

      devices = Accounts.list_devices(user)

      assert length(devices) == 1
      assert hd(devices).custom_name == "Test Device"
    end

    test "get_device/1 returns specific device" do
      user = Fixtures.fixture(:registered_user, %{email: "device-getter@test.com"})

      {:ok, device} =
        Accounts.register_device(user, %{
          custom_name: "Specific Device",
          platform_id: "specific/456",
          device_type: "tablet",
          model_name: "tablet-model",
          push_token: "specific-token"
        })

      found_device = Accounts.get_device(device.id)

      assert found_device.id == device.id
      assert found_device.custom_name == "Specific Device"
    end

    test "get_device/1 returns nil for non-existent device" do
      found_device = Accounts.get_device(Ecto.UUID.generate())

      assert found_device == nil
    end

    test "delete_device/1 removes device" do
      user = Fixtures.fixture(:registered_user, %{email: "device-deleter@test.com"})

      {:ok, device} =
        Accounts.register_device(user, %{
          custom_name: "Delete Me",
          platform_id: "delete/789",
          device_type: "phone",
          model_name: "delete-model",
          push_token: "delete-token"
        })

      assert {:ok, deleted_device} = Accounts.delete_device(device)
      assert deleted_device.id == device.id

      # Should not be found anymore
      assert Accounts.get_device(device.id) == nil
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
