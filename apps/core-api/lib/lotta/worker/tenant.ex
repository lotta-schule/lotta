defmodule Lotta.Worker.Tenant do
  @moduledoc """
  Worker for fetching a files metadata.
  """
  alias Lotta.Accounts.User
  alias Lotta.{Accounts, Analytics, Tenants}
  alias Lotta.Tenants.{DefaultContent, Tenant}
  alias Lotta.Administration.Notification.Slack

  use Oban.Worker,
    queue: :tenant,
    max_attempts: 3,
    # 0-9, 0 is highest
    priority: 0,
    unique: [
      period: :infinity,
      timestamp: :scheduled_at,
      states: Oban.Job.states(),
      fields: [:worker, :args]
    ]

  require Logger

  @impl Oban.Worker
  def perform(%{
        id: _job_id,
        args:
          %{
            "type" => "setup",
            "id" => tenant_id,
            "user_email" => _email,
            "user_password" => password,
            "eduplaces_id" => _eduplaces_id
          } = args
      }) do
    tenant = Tenants.get_tenant(tenant_id) || raise "Tenant not found"

    where_clause =
      case args do
        %{"eduplaces_id" => eduplaces_id}
        when not is_nil(eduplaces_id) and byte_size(eduplaces_id) > 0 ->
          [eduplaces_id: eduplaces_id]

        %{"user_email" => email} when not is_nil(email) and byte_size(email) > 0 ->
          [email: email]
      end

    user =
      User
      |> Lotta.Repo.get_by!(where_clause, prefix: tenant.prefix)
      |> Map.put(:password, password)

    with :ok <- DefaultContent.create_default_content(tenant, user) do
      init_analytics(tenant)
      notify_created(tenant)
      :ok
    end
  end

  def perform(%{
        id: _job_id,
        args: %{"type" => "init_analytics", "id" => tenant_id}
      }) do
    case Tenants.get_tenant(tenant_id) do
      nil ->
        Logger.error("Tenant with ID #{tenant_id} not found for analytics setup")
        {:error, :tenant_not_found}

      tenant ->
        Analytics.create_site(tenant)
    end
  end

  def perform(%{
        id: _job_id,
        args: %{"type" => "notify_created", "id" => tenant_id}
      }) do
    if tenant = Tenants.get_tenant(tenant_id) do
      admin_users = Accounts.list_admin_users(tenant)

      tenant
      |> Slack.new_lotta_notification(admin_users)
      |> Slack.send()
    else
      Logger.error("Tenant with ID #{tenant_id} not found for creation notification")
      {:error, :tenant_not_found}
    end
  end

  def perform(%{
        id: _job_id,
        args: %{"type" => "collect_daily_usage_logs"}
      }) do
    Logger.info("Starting daily usage log collection for all tenants")

    tenants = Tenants.list_tenants()

    results =
      Enum.map(tenants, fn tenant ->
        case Tenants.create_usage_logs(tenant) do
          :ok ->
            Logger.debug("Successfully created usage logs for tenant #{tenant.slug}")
            {:ok, tenant.id}

          {:error, reason} ->
            Logger.error(
              "Failed to create usage logs for tenant #{tenant.slug}: #{inspect(reason)}"
            )

            {:error, tenant.id, reason}
        end
      end)

    success_count = Enum.count(results, fn result -> match?({:ok, _}, result) end)
    failure_count = Enum.count(results, fn result -> match?({:error, _, _}, result) end)

    Logger.info(
      "Daily usage log collection completed. Success: #{success_count}, Failures: #{failure_count}"
    )

    :ok
  end

  @impl Oban.Worker
  def timeout(_job), do: :timer.minutes(5)

  @spec setup_default_content(Tenant.t(), User.t()) ::
          {:ok, Oban.Job.t()} | {:error, String.t()}
  def setup_default_content(%Tenant{id: id}, %User{
        email: email,
        password: password,
        eduplaces_id: eduplaces_id
      }) do
    __MODULE__.new(%{
      "type" => "setup",
      "id" => id,
      "user_email" => email,
      "user_password" => password,
      "eduplaces_id" => eduplaces_id
    })
    |> Oban.insert()
  end

  @spec init_analytics(Tenant.t()) ::
          {:ok, Oban.Job.t()} | {:error, String.t()}
  def init_analytics(%{id: id}) do
    __MODULE__.new(%{
      "type" => "init_analytics",
      "id" => id
    })
    |> Oban.insert()
  end

  @spec notify_created(Tenant.t()) ::
          {:ok, Oban.Job.t()} | {:error, String.t()}
  def notify_created(%{id: id}) do
    __MODULE__.new(%{
      "type" => "notify_created",
      "id" => id
    })
    |> Oban.insert()
  end

  @spec delete_analytics(Tenant.t()) ::
          {:ok, Oban.Job.t()} | {:error, Oban.Job.changeset() | String.t()}
  def delete_analytics(%{site_id: site_id}) do
    __MODULE__.new(%{
      "type" => "delete_analytics",
      "site_id" => site_id
    })
    |> Oban.insert()
  end

  @doc """
  Schedules a job to collect daily usage logs for all tenants.
  This should typically be scheduled via a cron job to run daily.
  """
  @spec collect_daily_usage_logs() ::
          {:ok, Oban.Job.t()} | {:error, Oban.Job.changeset() | String.t()}
  def collect_daily_usage_logs do
    __MODULE__.new(%{
      "type" => "collect_daily_usage_logs"
    })
    |> Oban.insert()
  end
end
