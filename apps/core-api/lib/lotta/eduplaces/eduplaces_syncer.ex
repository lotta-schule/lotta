defmodule Lotta.Eduplaces.EduplacesSyncer do
  @moduledoc """
  GenServer that periodically syncs Eduplaces groups for all tenants
  with an eduplaces_id set.

  This syncer:
  - Runs every 30 minutes by default
  - Fetches groups from Eduplaces IDM for each tenant
  - Creates new groups that exist in Eduplaces but not locally
  - Updates group names when they change in Eduplaces
  - Deletes groups that no longer exist in Eduplaces or are marked INACTIVE

  ## Configuration

  The syncer can be configured via application environment:

      config :lotta, Lotta.Eduplaces.EduplacesSyncer,
        enabled: true,
        interval: :timer.minutes(30)

  - `enabled`: Whether the syncer is active (default: true)
  - `interval`: Time between syncs in milliseconds (default: 30 minutes)

  ## Manual Sync

  You can trigger a manual sync using:

      Lotta.Eduplaces.EduplacesSyncer.trigger_sync()

  ## Telemetry

  Emits telemetry events at `[:lotta, :eduplaces, :sync]` with measurements:
  - `duration`: Time taken to sync in milliseconds
  - `success`: Number of successfully synced tenants
  - `errors`: Number of tenants that failed to sync
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
  Starts the EduplacesSyncer GenServer.
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
      Logger.info("[EduplacesSyncer] Started with interval: #{interval}ms")
    else
      Logger.info("[EduplacesSyncer] Started but disabled")
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
      Logger.info("[EduplacesSyncer] Starting scheduled sync")
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
    Logger.info("[EduplacesSyncer] Manual sync triggered")
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

    Logger.info("[EduplacesSyncer] Syncing #{length(tenants)} tenant(s)")

    results =
      Enum.map(tenants, fn tenant ->
        sync_tenant_groups(tenant)
      end)

    duration = System.monotonic_time(:millisecond) - start_time

    success_count = Enum.count(results, &match?({:ok, _}, &1))
    error_count = Enum.count(results, &match?({:error, _}, &1))

    Logger.info(
      "[EduplacesSyncer] Sync completed in #{duration}ms. Success: #{success_count}, Errors: #{error_count}"
    )

    emit_telemetry(duration, success_count, error_count)

    {:ok, %{success: success_count, errors: error_count, duration: duration}}
  end

  @doc false
  def list_eduplaces_tenants do
    Tenants.list_eduplaces_tenants()
  end

  @doc false
  def sync_tenant_groups(%Tenant{} = tenant) do
    Logger.debug("[EduplacesSyncer] Syncing tenant: #{tenant.slug} (#{tenant.eduplaces_id})")

    with {:ok, eduplaces_groups} <- fetch_eduplaces_groups(tenant),
         {:ok, result} <- reconcile_groups(tenant, eduplaces_groups) do
      Logger.info(
        "[EduplacesSyncer] Tenant #{tenant.slug}: Created #{result.created}, Updated #{result.updated}, Deleted #{result.deleted}"
      )

      {:ok, result}
    else
      {:error, reason} = error ->
        Logger.error("[EduplacesSyncer] Failed to sync tenant #{tenant.slug}: #{inspect(reason)}")

        error
    end
  end

  defp fetch_eduplaces_groups(%Tenant{} = tenant) do
    case IDM.list_groups(tenant) do
      {:ok, groups} when is_list(groups) ->
        {:ok, groups}

      {:error, reason} = error ->
        Logger.error(
          "[EduplacesSyncer] Failed to fetch groups from IDM for tenant #{tenant.slug}: #{inspect(reason)}"
        )

        error
    end
  end

  defp reconcile_groups(%Tenant{} = tenant, eduplaces_groups) do
    # Set the repository prefix to the tenant's schema
    Repo.put_prefix(tenant.prefix)

    # Get existing groups with eduplaces_id
    existing_groups = list_tenant_eduplaces_groups()

    # Build maps for easier lookup
    eduplaces_map =
      Map.new(eduplaces_groups, fn group ->
        {group["id"], group}
      end)

    existing_map =
      Map.new(existing_groups, fn group ->
        {group.eduplaces_id, group}
      end)

    # Determine what needs to be created, updated, and deleted
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

    # Filter out INACTIVE groups from updates and add to deletions
    {to_update, inactive_groups} =
      Enum.split_with(to_update, fn id ->
        eduplaces_map[id]["status"] == "ACTIVE"
      end)

    to_delete = to_delete ++ inactive_groups

    # Perform operations
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
          "[EduplacesSyncer] Created group '#{group_data["name"]}' for tenant #{tenant.slug}"
        )

        count + 1

      {:error, changeset} ->
        Logger.error(
          "[EduplacesSyncer] Failed to create group '#{group_data["name"]}' for tenant #{tenant.slug}: #{inspect(changeset.errors)}"
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
          "[EduplacesSyncer] Updated group '#{existing_group.name}' -> '#{eduplaces_group["name"]}' for tenant #{tenant.slug}"
        )

        count + 1

      {:error, changeset} ->
        Logger.error(
          "[EduplacesSyncer] Failed to update group '#{existing_group.name}' for tenant #{tenant.slug}: #{inspect(changeset.errors)}"
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
            "[EduplacesSyncer] Deleted group '#{group.name}' for tenant #{tenant.slug}"
          )

          count + 1

        {:error, reason} ->
          Logger.error(
            "[EduplacesSyncer] Failed to delete group '#{group.name}' for tenant #{tenant.slug}: #{inspect(reason)}"
          )

          count
      end
    end)
  end

  defp emit_telemetry(duration, success_count, error_count) do
    :telemetry.execute(
      [:lotta, :eduplaces, :sync],
      %{duration: duration, success: success_count, errors: error_count},
      %{}
    )
  end
end
