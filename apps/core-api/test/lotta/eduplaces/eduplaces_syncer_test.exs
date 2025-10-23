defmodule Lotta.Eduplaces.EduplacesSyncerTest do
  import Mock
  import ExUnit.CaptureLog

  alias Lotta.Eduplaces.{EduplacesSyncer, IDM}
  alias Lotta.{Accounts, Repo}
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

      with_mock IDM, list_groups: fn _tenant -> {:ok, eduplaces_groups} end do
        result = EduplacesSyncer.sync_tenant_groups(tenant)

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

      with_mock IDM, list_groups: fn _tenant -> {:ok, eduplaces_groups} end do
        result = EduplacesSyncer.sync_tenant_groups(tenant)

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

      with_mock IDM, list_groups: fn _tenant -> {:ok, eduplaces_groups} end do
        result = EduplacesSyncer.sync_tenant_groups(tenant)

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

      with_mock IDM, list_groups: fn _tenant -> {:ok, eduplaces_groups} end do
        result = EduplacesSyncer.sync_tenant_groups(tenant)

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

      with_mock IDM, list_groups: fn _tenant -> {:ok, eduplaces_groups} end do
        result = EduplacesSyncer.sync_tenant_groups(tenant)

        assert {:ok, %{created: 0, updated: 0, deleted: 1}} = result

        groups = Accounts.list_user_groups()
        assert length(groups) == 1
        assert Enum.any?(groups, &(&1.eduplaces_id == "group-2"))
        refute Enum.any?(groups, &(&1.eduplaces_id == "group-1"))
      end
    end

    test "deletes groups marked as INACTIVE in Eduplaces", %{tenant: tenant} do
      # Create group that will become inactive
      {:ok, _group} =
        Accounts.create_user_group(%{name: "Active Group", eduplaces_id: "group-1", sort_key: 10})

      eduplaces_groups = [
        %{"id" => "group-1", "name" => "Active Group", "status" => "INACTIVE"}
      ]

      with_mock IDM, list_groups: fn _tenant -> {:ok, eduplaces_groups} end do
        result = EduplacesSyncer.sync_tenant_groups(tenant)

        assert {:ok, %{created: 0, updated: 0, deleted: 1}} = result

        groups = Accounts.list_user_groups()
        assert length(groups) == 0
      end
    end

    test "handles mixed operations in a single sync", %{tenant: tenant} do
      # Create existing groups
      {:ok, _group1} =
        Accounts.create_user_group(%{name: "Old Name", eduplaces_id: "group-1", sort_key: 10})

      {:ok, _group2} =
        Accounts.create_user_group(%{name: "To Delete", eduplaces_id: "group-2", sort_key: 20})

      eduplaces_groups = [
        %{"id" => "group-1", "name" => "Updated Name", "status" => "ACTIVE"},
        %{"id" => "group-3", "name" => "New Group", "status" => "ACTIVE"}
      ]

      with_mock IDM, list_groups: fn _tenant -> {:ok, eduplaces_groups} end do
        result = EduplacesSyncer.sync_tenant_groups(tenant)

        assert {:ok, %{created: 1, updated: 1, deleted: 1}} = result

        groups = Accounts.list_user_groups()
        assert length(groups) == 2

        # Check updated group
        updated_group = Enum.find(groups, &(&1.eduplaces_id == "group-1"))
        assert updated_group.name == "Updated Name"

        # Check new group
        assert Enum.any?(groups, &(&1.eduplaces_id == "group-3" && &1.name == "New Group"))

        # Check deleted group is gone
        refute Enum.any?(groups, &(&1.eduplaces_id == "group-2"))
      end
    end

    test "handles API errors gracefully", %{tenant: tenant} do
      with_mock IDM, list_groups: fn _tenant -> {:error, :api_error} end do
        log =
          capture_log(fn ->
            result = EduplacesSyncer.sync_tenant_groups(tenant)
            assert {:error, :api_error} = result
          end)

        assert log =~ "Failed to fetch groups from IDM"
      end
    end

    test "continues syncing even if one operation fails", %{tenant: tenant} do
      eduplaces_groups = [
        %{"id" => "group-1", "name" => "Valid Group", "status" => "ACTIVE"}
      ]

      # Mock create to fail by using an invalid group name
      with_mock IDM, list_groups: fn _tenant -> {:ok, eduplaces_groups} end do
        with_mock Accounts,
          create_user_group: fn _attrs -> {:error, %Ecto.Changeset{}} end do
          log =
            capture_log(fn ->
              result = EduplacesSyncer.sync_tenant_groups(tenant)
              # Even though creation failed, the function should complete
              assert {:ok, %{created: 0, updated: 0, deleted: 0}} = result
            end)

          assert log =~ "Failed to create group"
        end
      end
    end
  end

  describe "list_eduplaces_tenants/0" do
    test "returns only tenants with eduplaces_id set", %{tenant: tenant} do
      # The setup already set eduplaces_id on the test tenant
      tenants = EduplacesSyncer.list_eduplaces_tenants()

      # Should have at least the test tenant
      assert length(tenants) >= 1
      # All returned tenants should have eduplaces_id set
      assert Enum.all?(tenants, &(&1.eduplaces_id != nil))
      # Should include our test tenant
      assert Enum.any?(tenants, &(&1.eduplaces_id == tenant.eduplaces_id))
    end
  end

  describe "GenServer behavior" do
    test "starts with correct initial state" do
      # The syncer might already be started by the application
      # Get the PID or start it
      pid =
        case Process.whereis(EduplacesSyncer) do
          nil ->
            {:ok, pid} = EduplacesSyncer.start_link(enabled: false)
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
      with_mock IDM, list_groups: fn _tenant -> {:ok, []} end do
        result = EduplacesSyncer.trigger_sync()

        assert {:ok, %{success: _, errors: _, duration: _}} = result
      end
    end
  end
end
