defmodule Lotta.Eduplaces.SyncerTest do
  import Mock
  import ExUnit.CaptureLog
  import Lotta.Fixtures

  alias Lotta.Eduplaces.{Syncer, IDM}
  alias Lotta.{Accounts, Repo}
  alias Lotta.Accounts.User
  alias Lotta.Tenants.{Tenant, TenantDbManager}

  use Lotta.DataCase, async: false

  @test_prefix "test_tenant_eduplaces_syncer"

  setup do
    tenant =
      %Tenant{
        title: "Test School",
        slug: "test-school",
        prefix: @test_prefix,
        eduplaces_id: "school-test-123"
      }
      |> Repo.insert!(prefix: "public")

    {:ok, _} = TenantDbManager.create_tenant_database_schema(tenant)
    Repo.put_prefix(@test_prefix)

    {:ok, %{tenant: tenant}}
  end

  describe "sync_tenant_groups/1" do
    test "creates new groups from Eduplaces", %{tenant: tenant} do
      eduplaces_groups = [
        %{"id" => "group-1", "name" => "Class 5A", "status" => "ACTIVE"},
        %{"id" => "group-2", "name" => "Class 5B", "status" => "ACTIVE"}
      ]

      with_mock IDM,
        list_groups: fn _tenant -> {:ok, eduplaces_groups} end,
        get_group: fn _group -> {:ok, %{"members" => []}} end do
        result = Syncer.sync_tenant_groups(tenant)

        assert {:ok, %{created: 2, updated: 0, deleted: 0}} = result

        groups = Accounts.list_user_groups()
        assert length(groups) == 2
        assert Enum.any?(groups, &(&1.eduplaces_id == "group-1" && &1.name == "Class 5A"))
        assert Enum.any?(groups, &(&1.eduplaces_id == "group-2" && &1.name == "Class 5B"))
      end
    end

    test "does not create INACTIVE groups from Eduplaces", %{tenant: tenant} do
      eduplaces_groups = [
        %{"id" => "group-1", "name" => "Class 5A", "status" => "ACTIVE"},
        %{"id" => "group-2", "name" => "Class 5B", "status" => "INACTIVE"}
      ]

      with_mock IDM,
        list_groups: fn _tenant -> {:ok, eduplaces_groups} end,
        get_group: fn _group -> {:ok, %{"members" => []}} end do
        result = Syncer.sync_tenant_groups(tenant)

        assert {:ok, %{created: 1, updated: 0, deleted: 0}} = result

        groups = Accounts.list_user_groups()
        assert length(groups) == 1
        assert Enum.any?(groups, &(&1.eduplaces_id == "group-1"))
        refute Enum.any?(groups, &(&1.eduplaces_id == "group-2"))
      end
    end

    test "updates existing group names when they change in Eduplaces", %{tenant: tenant} do
      # Create existing group
      {:ok, _group} =
        Accounts.create_user_group(%{name: "Old Name", eduplaces_id: "group-1", sort_key: 10})

      eduplaces_groups = [
        %{"id" => "group-1", "name" => "New Name", "status" => "ACTIVE"}
      ]

      with_mock IDM,
        list_groups: fn _tenant -> {:ok, eduplaces_groups} end,
        get_group: fn _group -> {:ok, %{"members" => []}} end do
        result = Syncer.sync_tenant_groups(tenant)

        assert {:ok, %{created: 0, updated: 1, deleted: 0}} = result

        groups = Accounts.list_user_groups()
        assert length(groups) == 1
        updated_group = Enum.find(groups, &(&1.eduplaces_id == "group-1"))
        assert updated_group.name == "New Name"
      end
    end

    test "does not update groups when name hasn't changed", %{tenant: tenant} do
      # Create existing group
      {:ok, _group} =
        Accounts.create_user_group(%{name: "Same Name", eduplaces_id: "group-1", sort_key: 10})

      eduplaces_groups = [
        %{"id" => "group-1", "name" => "Same Name", "status" => "ACTIVE"}
      ]

      with_mock IDM,
        list_groups: fn _tenant -> {:ok, eduplaces_groups} end,
        get_group: fn _group -> {:ok, %{"members" => []}} end do
        result = Syncer.sync_tenant_groups(tenant)

        assert {:ok, %{created: 0, updated: 0, deleted: 0}} = result
      end
    end

    test "deletes groups that no longer exist in Eduplaces", %{tenant: tenant} do
      # Create groups that will be deleted
      {:ok, _group1} =
        Accounts.create_user_group(%{name: "To Delete", eduplaces_id: "group-1", sort_key: 10})

      {:ok, _group2} =
        Accounts.create_user_group(%{name: "To Keep", eduplaces_id: "group-2", sort_key: 20})

      eduplaces_groups = [
        %{"id" => "group-2", "name" => "To Keep", "status" => "ACTIVE"}
      ]

      with_mock IDM,
        list_groups: fn _tenant -> {:ok, eduplaces_groups} end,
        get_group: fn _group -> {:ok, %{"members" => []}} end do
        result = Syncer.sync_tenant_groups(tenant)

        assert {:ok, %{created: 0, updated: 0, deleted: 1}} = result

        groups = Accounts.list_user_groups()
        assert length(groups) == 1
        assert Enum.any?(groups, &(&1.eduplaces_id == "group-2"))
        refute Enum.any?(groups, &(&1.eduplaces_id == "group-1"))
      end
    end

    test "deletes groups marked as INACTIVE in Eduplaces", %{tenant: tenant} do
      {:ok, _group} =
        Accounts.create_user_group(%{name: "Active Group", eduplaces_id: "group-1", sort_key: 10})

      eduplaces_groups = [
        %{"id" => "group-1", "name" => "Active Group", "status" => "INACTIVE"}
      ]

      with_mock IDM,
        list_groups: fn _tenant -> {:ok, eduplaces_groups} end,
        get_group: fn _group -> {:ok, %{"members" => []}} end do
        result = Syncer.sync_tenant_groups(tenant)

        assert {:ok, %{created: 0, updated: 0, deleted: 1}} = result

        groups = Accounts.list_user_groups()
        assert Enum.empty?(groups)
      end
    end

    test "handles mixed operations in a single sync", %{tenant: tenant} do
      {:ok, _group1} =
        Accounts.create_user_group(%{name: "Old Name", eduplaces_id: "group-1", sort_key: 10})

      {:ok, _group2} =
        Accounts.create_user_group(%{name: "To Delete", eduplaces_id: "group-2", sort_key: 20})

      eduplaces_groups = [
        %{"id" => "group-1", "name" => "Updated Name", "status" => "ACTIVE"},
        %{"id" => "group-3", "name" => "New Group", "status" => "ACTIVE"}
      ]

      with_mock IDM,
        list_groups: fn _tenant -> {:ok, eduplaces_groups} end,
        get_group: fn _group -> {:ok, %{"members" => []}} end do
        result = Syncer.sync_tenant_groups(tenant)

        assert {:ok, %{created: 1, updated: 1, deleted: 1}} = result

        groups = Accounts.list_user_groups()
        assert length(groups) == 2

        updated_group = Enum.find(groups, &(&1.eduplaces_id == "group-1"))
        assert updated_group.name == "Updated Name"

        assert Enum.any?(groups, &(&1.eduplaces_id == "group-3" && &1.name == "New Group"))

        refute Enum.any?(groups, &(&1.eduplaces_id == "group-2"))
      end
    end

    test "handles API errors gracefully", %{tenant: tenant} do
      with_mock IDM, list_groups: fn _tenant -> {:error, :api_error} end do
        log =
          capture_log(fn ->
            result = Syncer.sync_tenant_groups(tenant)
            assert {:error, :api_error} = result
          end)

        assert log =~ "Failed to fetch groups from IDM"
      end
    end

    test "continues syncing even if one operation fails", %{tenant: tenant} do
      eduplaces_groups = [
        %{"id" => "group-1", "name" => "Valid Group", "status" => "ACTIVE"}
      ]

      with_mock IDM, list_groups: fn _tenant -> {:ok, eduplaces_groups} end do
        with_mock Accounts,
          create_user_group: fn _attrs -> {:error, %Ecto.Changeset{}} end do
          log =
            capture_log(fn ->
              result = Syncer.sync_tenant_groups(tenant)
              assert {:ok, %{created: 0, updated: 0, deleted: 0}} = result
            end)

          assert log =~ "Failed to create group"
        end
      end
    end
  end

  describe "sync_group_members/2" do
    test "syncs group members from Eduplaces", %{tenant: tenant} do
      {:ok, group} =
        Accounts.create_user_group(%{name: "Test Group", eduplaces_id: "group-1", sort_key: 10})

      user1 =
        %User{}
        |> Map.merge(
          Lotta.Fixtures.fixture(:valid_eduplace_user_attrs, %{
            eduplaces_id: "user-1",
            email: "user1@sync-test.com"
          })
        )
        |> Repo.insert!(prefix: @test_prefix)

      user2 =
        %User{}
        |> Map.merge(
          Lotta.Fixtures.fixture(:valid_eduplace_user_attrs, %{
            eduplaces_id: "user-2",
            email: "user2@sync-test.com"
          })
        )
        |> Repo.insert!(prefix: @test_prefix)

      group_details = %{
        "id" => "group-1",
        "name" => "Test Group",
        "members" => [
          %{"id" => "user-1"},
          %{"id" => "user-2"}
        ]
      }

      with_mock IDM, get_group: fn _group -> {:ok, group_details} end do
        result = Syncer.sync_group_members(tenant, group)

        assert {:ok, %{added: 2, removed: 0}} = result

        # Verify members were added
        updated_group = Repo.preload(Accounts.get_user_group(group.id), :users)
        member_ids = Enum.map(updated_group.users, & &1.id)
        assert user1.id in member_ids
        assert user2.id in member_ids
      end
    end

    test "adds new members and removes old ones", %{tenant: tenant} do
      {:ok, group} =
        Accounts.create_user_group(%{name: "Test Group", eduplaces_id: "group-1", sort_key: 10})

      user1 =
        %User{}
        |> Map.merge(
          Lotta.Fixtures.fixture(:valid_eduplace_user_attrs, %{
            eduplaces_id: "user-1",
            email: "user1-add-remove@test.com"
          })
        )
        |> Repo.insert!(prefix: @test_prefix)

      user2 =
        %User{}
        |> Map.merge(
          Lotta.Fixtures.fixture(:valid_eduplace_user_attrs, %{
            eduplaces_id: "user-2",
            email: "user2-add-remove@test.com"
          })
        )
        |> Repo.insert!(prefix: @test_prefix)

      user3 =
        %User{}
        |> Map.merge(
          Lotta.Fixtures.fixture(:valid_eduplace_user_attrs, %{
            eduplaces_id: "user-3",
            email: "user3-add-remove@test.com"
          })
        )
        |> Repo.insert!(prefix: @test_prefix)

      Accounts.set_group_members(group, [user1, user2])

      group_details = %{
        "id" => "group-1",
        "name" => "Test Group",
        "members" => [
          %{"id" => "user-1"},
          %{"id" => "user-3"}
        ]
      }

      with_mock IDM, get_group: fn _group -> {:ok, group_details} end do
        result = Syncer.sync_group_members(tenant, group)

        assert {:ok, %{added: 1, removed: 1}} = result

        updated_group = Repo.preload(Accounts.get_user_group(group.id), :users, force: true)
        member_ids = Enum.map(updated_group.users, & &1.id)
        assert user1.id in member_ids
        assert user3.id in member_ids
        refute user2.id in member_ids
      end
    end

    test "handles orphaned users (users in eduplaces but not in local DB)", %{tenant: tenant} do
      {:ok, group} =
        Accounts.create_user_group(%{name: "Test Group", eduplaces_id: "group-1", sort_key: 10})

      user1 =
        %User{}
        |> Map.merge(
          Lotta.Fixtures.fixture(:valid_eduplace_user_attrs, %{
            eduplaces_id: "user-1",
            email: "user1-orphan@test.com"
          })
        )
        |> Repo.insert!(prefix: @test_prefix)

      group_details = %{
        "id" => "group-1",
        "name" => "Test Group",
        "members" => [
          %{"id" => "user-1"},
          %{"id" => "orphaned-user"}
        ]
      }

      with_mock IDM, get_group: fn _group -> {:ok, group_details} end do
        import ExUnit.CaptureLog

        log =
          capture_log(fn ->
            result = Syncer.sync_group_members(tenant, group)

            assert {:ok, %{added: 1, removed: 0}} = result
          end)

        assert log =~ "orphaned user"

        updated_group = Repo.preload(Accounts.get_user_group(group.id), :users)
        assert length(updated_group.users) == 1
        assert hd(updated_group.users).id == user1.id
      end
    end

    test "handles groups with no members", %{tenant: tenant} do
      {:ok, group} =
        Accounts.create_user_group(%{name: "Empty Group", eduplaces_id: "group-1", sort_key: 10})

      user1 =
        %User{}
        |> Map.merge(
          fixture(:valid_eduplace_user_attrs, %{
            eduplaces_id: "user-1",
            email: "user1-empty@test.com"
          })
        )
        |> Repo.insert!(prefix: @test_prefix)

      Accounts.set_group_members(group, [user1])

      group_details = %{
        "id" => "group-1",
        "name" => "Empty Group",
        "members" => []
      }

      with_mock IDM, get_group: fn _group -> {:ok, group_details} end do
        result = Syncer.sync_group_members(tenant, group)

        assert {:ok, %{added: 0, removed: 1}} = result

        updated_group = Repo.preload(Accounts.get_user_group(group.id), :users, force: true)
        assert updated_group.users == []
      end
    end

    test "handles IDM API errors gracefully", %{tenant: tenant} do
      {:ok, group} =
        Accounts.create_user_group(%{name: "Test Group", eduplaces_id: "group-1", sort_key: 10})

      with_mock IDM, get_group: fn _group -> {:error, :api_error} end do
        import ExUnit.CaptureLog

        log =
          capture_log(fn ->
            result = Syncer.sync_group_members(tenant, group)
            assert {:error, :api_error} = result
          end)

        assert log =~ "Failed to fetch group details"
      end
    end

    test "no changes when members are the same", %{tenant: tenant} do
      {:ok, group} =
        Accounts.create_user_group(%{name: "Test Group", eduplaces_id: "group-1", sort_key: 10})

      user1 =
        %User{}
        |> Map.merge(
          fixture(:valid_eduplace_user_attrs, %{
            eduplaces_id: "user-1"
          })
        )
        |> Repo.insert!(prefix: @test_prefix)

      Accounts.set_group_members(group, [user1])

      group_details = %{
        "id" => "group-1",
        "name" => "Test Group",
        "members" => [
          %{"id" => "user-1"}
        ]
      }

      with_mock IDM, get_group: fn _group -> {:ok, group_details} end do
        result = Syncer.sync_group_members(tenant, group)

        assert {:ok, %{added: 0, removed: 0}} = result
      end
    end
  end

  describe "sync_tenant_groups/1 with members" do
    test "syncs both groups and members in one call", %{tenant: tenant} do
      user1 =
        %User{}
        |> Map.merge(fixture(:valid_eduplace_user_attrs))
        |> Map.merge(%{
          eduplaces_id: "user-1",
          email: "user1-integration@test.com"
        })
        |> Repo.insert!(prefix: @test_prefix)

      user2 =
        %User{}
        |> Map.merge(fixture(:valid_eduplace_user_attrs))
        |> Map.merge(%{
          eduplaces_id: "user-2",
          email: "user2-integration@test.com"
        })
        |> Repo.insert!(prefix: @test_prefix)

      eduplaces_groups = [
        %{"id" => "group-1", "name" => "Class 5A", "status" => "ACTIVE"}
      ]

      group_details = %{
        "id" => "group-1",
        "name" => "Class 5A",
        "members" => [
          %{"id" => "user-1"},
          %{"id" => "user-2"}
        ]
      }

      with_mock IDM,
        list_groups: fn _tenant -> {:ok, eduplaces_groups} end,
        get_group: fn _group -> {:ok, group_details} end do
        assert {:ok,
                %{
                  created: 1,
                  updated: 0,
                  deleted: 0,
                  groups_synced: 1,
                  members_added: 2,
                  members_removed: 0
                }} = Syncer.sync_tenant_groups(tenant)

        groups = Accounts.list_user_groups()
        assert length(groups) == 1
        group = hd(groups)
        group_with_users = Repo.preload(group, :users)
        assert length(group_with_users.users) == 2

        member_ids = Enum.map(group_with_users.users, & &1.id)
        assert user1.id in member_ids
        assert user2.id in member_ids
      end
    end
  end

  describe "list_eduplaces_tenants/0" do
    test "returns only tenants with eduplaces_id set", %{tenant: tenant} do
      tenants = Syncer.list_eduplaces_tenants()

      assert length(tenants) >= 1
      assert Enum.all?(tenants, &(&1.eduplaces_id != nil))
      assert Enum.any?(tenants, &(&1.eduplaces_id == tenant.eduplaces_id))
    end
  end

  describe "GenServer behavior" do
    test "starts with correct initial state" do
      # The syncer might already be started by the application
      # Get the PID or start it
      pid =
        case Process.whereis(Syncer) do
          nil ->
            {:ok, pid} = Syncer.start_link(enabled: false)
            pid

          pid ->
            pid
        end

      state = :sys.get_state(pid)

      assert is_boolean(state.enabled)
      assert is_integer(state.sync_count)
      assert is_integer(state.interval)
    end

    test "trigger_sync/0 performs manual sync", %{tenant: _tenant} do
      with_mock IDM,
        list_groups: fn _tenant -> {:ok, []} end,
        get_group: fn _group -> {:ok, %{"members" => []}} end do
        result = Syncer.trigger_sync()

        assert {:ok,
                %{
                  success: _,
                  errors: _,
                  duration: _,
                  members_added: _,
                  members_removed: _
                }} = result
      end
    end
  end
end
