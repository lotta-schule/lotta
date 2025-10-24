defmodule Lotta.Eduplaces.Syncer do
  @moduledoc """
  GenServer that periodically syncs Eduplaces groups and their members for all tenants
  with an eduplaces_id set.

  This syncer:
  - Runs every 30 minutes by default
  - Fetches groups from Eduplaces IDM for each tenant
  - Creates new groups that exist in Eduplaces but not locally
  - Updates group names when they change in Eduplaces
  - Deletes groups that no longer exist in Eduplaces or are marked INACTIVE
  - Syncs group members by fetching member lists from Eduplaces
  - Adds/removes users from groups based on Eduplaces membership
  - Ignores users that exist in Eduplaces but not in the local database

  ## Configuration

  The syncer can be configured via application environment:

      config :lotta, Lotta.Eduplaces.Syncer,
        enabled: true,
        interval: :timer.minutes(30)

  - `enabled`: Whether the syncer is active (default: true)
  - `interval`: Time between syncs in milliseconds (default: 30 minutes)

  ## Manual Sync

  You can trigger a manual sync using:

      Lotta.Eduplaces.Syncer.trigger_sync()

  ## Telemetry

  Emits telemetry events at `[:lotta, :eduplaces, :sync]` with measurements:
  - `duration`: Time taken to sync in milliseconds
  - `success`: Number of successfully synced tenants
  - `errors`: Number of tenants that failed to sync
  - `members_added`: Total number of members added across all groups
  - `members_removed`: Total number of members removed across all groups
  """

  use GenServer
  require Logger

  import Ecto.Query

  alias Lotta.{Accounts, Repo, Tenants}
  alias Lotta.Accounts.UserGroup
  alias Lotta.Eduplaces.IDM
  alias Lotta.Tenants.Tenant

  @default_interval :timer.minutes(30)

  # Client API

  @doc """
  Starts the Syncer GenServer.
  """
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Manually trigger a sync operation.
  Useful for testing or admin operations.
  """
  def trigger_sync do
    GenServer.call(__MODULE__, :sync, :timer.minutes(5))
  end

  # Server Callbacks

  @impl true
  def init(opts) do
    interval = Keyword.get(opts, :interval, @default_interval)
    enabled = Keyword.get(opts, :enabled, true)

    if enabled do
      schedule_sync(interval)
      Logger.info("[Eduplaces.Syncer] Started with interval: #{interval}ms")
    else
      Logger.info("[Eduplaces.Syncer] Started but disabled")
    end

    {:ok,
     %{
       interval: interval,
       enabled: enabled,
       last_sync: nil,
       sync_count: 0
     }}
  end

  @impl true
  def handle_info(:sync, state) do
    if state.enabled do
      Logger.info("[Eduplaces.Syncer] Starting scheduled sync")
      perform_sync()
      schedule_sync(state.interval)

      {:noreply,
       %{
         state
         | last_sync: DateTime.utc_now(),
           sync_count: state.sync_count + 1
       }}
    else
      {:noreply, state}
    end
  end

  @impl true
  def handle_call(:sync, _from, state) do
    Logger.info("[Eduplaces.Syncer] Manual sync triggered")
    result = perform_sync()

    {:reply, result,
     %{
       state
       | last_sync: DateTime.utc_now(),
         sync_count: state.sync_count + 1
     }}
  end

  # Private Functions

  defp schedule_sync(interval) do
    Process.send_after(self(), :sync, interval)
  end

  @doc false
  def perform_sync do
    start_time = System.monotonic_time(:millisecond)

    tenants = list_eduplaces_tenants()

    Logger.info("[Eduplaces.Syncer] Syncing #{length(tenants)} tenant(s)")

    results =
      Enum.map(tenants, fn tenant ->
        sync_tenant_groups(tenant)
      end)

    duration = System.monotonic_time(:millisecond) - start_time

    success_count = Enum.count(results, &match?({:ok, _}, &1))
    error_count = Enum.count(results, &match?({:error, _}, &1))

    {total_members_added, total_members_removed} =
      Enum.reduce(results, {0, 0}, fn
        {:ok, %{members_added: added, members_removed: removed}}, {total_added, total_removed} ->
          {total_added + added, total_removed + removed}

        _, acc ->
          acc
      end)

    Logger.info(
      "[Eduplaces.Syncer] Sync completed in #{duration}ms. Success: #{success_count}, Errors: #{error_count}, Members: #{total_members_added} added, #{total_members_removed} removed"
    )

    emit_telemetry(
      duration,
      success_count,
      error_count,
      total_members_added,
      total_members_removed
    )

    {:ok,
     %{
       success: success_count,
       errors: error_count,
       duration: duration,
       members_added: total_members_added,
       members_removed: total_members_removed
     }}
  end

  @doc false
  def list_eduplaces_tenants do
    Tenants.list_eduplaces_tenants()
  end

  @doc false
  def sync_tenant_groups(%Tenant{} = tenant) do
    Logger.debug("[Eduplaces.Syncer] Syncing tenant: #{tenant.slug} (#{tenant.eduplaces_id})")

    Repo.put_prefix(tenant.prefix)

    with {:ok, eduplaces_groups} <- fetch_eduplaces_groups(tenant),
         {:ok, groups_result} <- reconcile_groups(tenant, eduplaces_groups),
         {:ok, members_result} <- sync_all_group_members(tenant) do
      Logger.info(
        "[Eduplaces.Syncer] Tenant #{tenant.slug}: Created #{groups_result.created}, Updated #{groups_result.updated}, Deleted #{groups_result.deleted}, Members synced: #{members_result.groups_synced} groups (#{members_result.members_added} added, #{members_result.members_removed} removed)"
      )

      {:ok, Map.merge(groups_result, members_result)}
    else
      {:error, reason} = error ->
        Logger.error(
          "[Eduplaces.Syncer] Failed to sync tenant #{tenant.slug}: #{inspect(reason)}"
        )

        error
    end
  end

  defp fetch_eduplaces_groups(%Tenant{} = tenant) do
    case IDM.list_groups(tenant) do
      {:ok, groups} when is_list(groups) ->
        {:ok, groups}

      {:error, reason} = error ->
        Logger.error(
          "[Eduplaces.Syncer] Failed to fetch groups from IDM for tenant #{tenant.slug}: #{inspect(reason)}"
        )

        error
    end
  end

  defp reconcile_groups(%Tenant{} = tenant, eduplaces_groups) do
    existing_groups = list_tenant_eduplaces_groups()

    eduplaces_map =
      Map.new(eduplaces_groups, fn group ->
        {group["id"], group}
      end)

    existing_map =
      Map.new(existing_groups, fn group ->
        {group.eduplaces_id, group}
      end)

    eduplaces_ids = MapSet.new(Map.keys(eduplaces_map))
    existing_ids = MapSet.new(Map.keys(existing_map))

    to_create =
      MapSet.difference(eduplaces_ids, existing_ids)
      |> MapSet.to_list()

    to_update =
      MapSet.intersection(eduplaces_ids, existing_ids)
      |> MapSet.to_list()

    to_delete =
      MapSet.difference(existing_ids, eduplaces_ids)
      |> MapSet.to_list()

    {to_update, inactive_groups} =
      Enum.split_with(to_update, fn id ->
        eduplaces_map[id]["status"] == "ACTIVE"
      end)

    to_delete = to_delete ++ inactive_groups

    created = create_missing_groups(tenant, to_create, eduplaces_map)
    updated = update_changed_groups(tenant, to_update, eduplaces_map, existing_map)
    deleted = delete_obsolete_groups(tenant, to_delete, existing_map)

    {:ok, %{created: created, updated: updated, deleted: deleted}}
  end

  defp list_tenant_eduplaces_groups do
    from(g in UserGroup,
      where: not is_nil(g.eduplaces_id)
    )
    |> Repo.all()
  end

  defp create_missing_groups(tenant, ids, eduplaces_map) do
    Enum.reduce(ids, 0, fn id, count ->
      create_group_if_active(tenant, id, eduplaces_map[id], count)
    end)
  end

  defp create_group_if_active(tenant, id, %{"status" => "ACTIVE"} = group_data, count) do
    attrs = %{
      name: group_data["name"],
      eduplaces_id: id
    }

    case Accounts.create_user_group(attrs) do
      {:ok, _group} ->
        Logger.debug(
          "[Eduplaces.Syncer] Created group '#{group_data["name"]}' for tenant #{tenant.slug}"
        )

        count + 1

      {:error, changeset} ->
        Logger.error(
          "[Eduplaces.Syncer] Failed to create group '#{group_data["name"]}' for tenant #{tenant.slug}: #{inspect(changeset.errors)}"
        )

        count
    end
  end

  defp create_group_if_active(_tenant, _id, _group_data, count),
    do: count

  defp update_changed_groups(tenant, ids, eduplaces_map, existing_map) do
    Enum.reduce(ids, 0, fn id, count ->
      update_group_if_changed(tenant, eduplaces_map[id], existing_map[id], count)
    end)
  end

  defp update_group_if_changed(tenant, eduplaces_group, existing_group, count) do
    if eduplaces_group["name"] != existing_group.name do
      do_update_group(tenant, eduplaces_group, existing_group, count)
    else
      count
    end
  end

  defp do_update_group(tenant, eduplaces_group, existing_group, count) do
    attrs = %{name: eduplaces_group["name"]}

    case Accounts.update_user_group(existing_group, attrs) do
      {:ok, _group} ->
        Logger.debug(
          "[Eduplaces.Syncer] Updated group '#{existing_group.name}' -> '#{eduplaces_group["name"]}' for tenant #{tenant.slug}"
        )

        count + 1

      {:error, changeset} ->
        Logger.error(
          "[Eduplaces.Syncer] Failed to update group '#{existing_group.name}' for tenant #{tenant.slug}: #{inspect(changeset.errors)}"
        )

        count
    end
  end

  defp delete_obsolete_groups(tenant, ids, existing_map) do
    Enum.reduce(ids, 0, fn id, count ->
      group = existing_map[id]

      case Accounts.delete_user_group(group) do
        {:ok, _group} ->
          Logger.debug(
            "[Eduplaces.Syncer] Deleted group '#{group.name}' for tenant #{tenant.slug}"
          )

          count + 1

        {:error, reason} ->
          Logger.error(
            "[Eduplaces.Syncer] Failed to delete group '#{group.name}' for tenant #{tenant.slug}: #{inspect(reason)}"
          )

          count
      end
    end)
  end

  @doc false
  def sync_group_members(%Tenant{} = tenant, %UserGroup{} = group) do
    Logger.debug(
      "[Eduplaces.Syncer] Syncing members for group '#{group.name}' (#{group.eduplaces_id}) in tenant #{tenant.slug}"
    )

    with {:ok, group_details} <- fetch_group_details(group),
         {:ok, result} <- reconcile_group_members(tenant, group, group_details) do
      Logger.debug(
        "[Eduplaces.Syncer] Group '#{group.name}': Members added #{result.added}, removed #{result.removed}"
      )

      {:ok, result}
    else
      {:error, reason} = error ->
        Logger.error(
          "[Eduplaces.Syncer] Failed to sync members for group '#{group.name}' in tenant #{tenant.slug}: #{inspect(reason)}"
        )

        error
    end
  end

  defp fetch_group_details(%UserGroup{} = group) do
    case IDM.get_group(group) do
      {:ok, group_details} when is_map(group_details) ->
        {:ok, group_details}

      {:error, reason} = error ->
        Logger.error(
          "[Eduplaces.Syncer] Failed to fetch group details from IDM for group #{group.eduplaces_id}: #{inspect(reason)}"
        )

        error
    end
  end

  defp reconcile_group_members(%Tenant{} = _tenant, %UserGroup{} = group, group_details) do
    member_eduplaces_ids =
      case group_details["members"] do
        members when is_list(members) ->
          Enum.map(members, fn member -> member["id"] end)

        _ ->
          []
      end

    current_group = Repo.preload(group, :users)
    current_members = current_group.users
    current_member_ids = MapSet.new(current_members, & &1.id)

    eduplaces_users = Accounts.list_users_by_eduplaces_ids(member_eduplaces_ids)
    eduplaces_user_ids = MapSet.new(eduplaces_users, & &1.id)

    existing_eduplaces_ids = MapSet.new(eduplaces_users, & &1.eduplaces_id)
    requested_eduplaces_ids = MapSet.new(member_eduplaces_ids)
    orphaned_ids = MapSet.difference(requested_eduplaces_ids, existing_eduplaces_ids)

    if MapSet.size(orphaned_ids) > 0 do
      Logger.warning(
        "[Eduplaces.Syncer] Found #{MapSet.size(orphaned_ids)} orphaned user(s) in group '#{group.name}': #{inspect(MapSet.to_list(orphaned_ids))}"
      )
    end

    to_add_count = MapSet.size(MapSet.difference(eduplaces_user_ids, current_member_ids))
    to_remove_count = MapSet.size(MapSet.difference(current_member_ids, eduplaces_user_ids))

    if to_add_count > 0 or to_remove_count > 0 do
      case Accounts.set_group_members(group, eduplaces_users) do
        {:ok, _updated_group} ->
          {:ok, %{added: to_add_count, removed: to_remove_count}}

        {:error, changeset} ->
          Logger.error(
            "[Eduplaces.Syncer] Failed to update members for group '#{group.name}': #{inspect(changeset.errors)}"
          )

          {:error, changeset}
      end
    else
      {:ok, %{added: 0, removed: 0}}
    end
  end

  defp sync_all_group_members(%Tenant{} = tenant) do
    groups = list_tenant_eduplaces_groups()

    Logger.debug(
      "[Eduplaces.Syncer] Syncing members for #{length(groups)} group(s) in tenant #{tenant.slug}"
    )

    results =
      Enum.map(groups, fn group ->
        sync_group_members(tenant, group)
      end)

    # Aggregate the results
    groups_synced = Enum.count(results, &match?({:ok, _}, &1))
    groups_failed = Enum.count(results, &match?({:error, _}, &1))

    {members_added, members_removed} =
      Enum.reduce(results, {0, 0}, fn
        {:ok, %{added: added, removed: removed}}, {total_added, total_removed} ->
          {total_added + added, total_removed + removed}

        {:error, _}, acc ->
          acc
      end)

    if groups_failed > 0 do
      Logger.warning(
        "[Eduplaces.Syncer] Member sync completed with errors: #{groups_failed} group(s) failed"
      )

      {:error,
       %{
         groups_synced: groups_synced,
         groups_failed: groups_failed,
         members_added: members_added,
         members_removed: members_removed
       }}
    else
      {:ok,
       %{
         groups_synced: groups_synced,
         members_added: members_added,
         members_removed: members_removed
       }}
    end
  end

  defp emit_telemetry(
         duration,
         success_count,
         error_count,
         members_added,
         members_removed
       ) do
    :telemetry.execute(
      [:lotta, :eduplaces, :sync],
      %{
        duration: duration,
        success: success_count,
        errors: error_count,
        members_added: members_added,
        members_removed: members_removed
      },
      %{}
    )
  end
end
