defmodule Lotta.Administration.Measurements do
  @moduledoc """
  Gather measurements for a multitude of Lottas.
  """
  import Ecto.Query

  alias Lotta.Repo
  alias Lotta.Tenants.{Tenant, UsageLog}

  def count_tenants do
    Repo.aggregate(Tenant, :count, :id)
  end

  @doc """
  Counts tenants whose administrative state is `:active` (as opposed to
  `:init` or `:readonly`).
  """
  def count_active_tenants do
    Tenant
    |> where([t], t.state == :active)
    |> Repo.aggregate(:count, :id)
  end

  @doc """
  Sums the most recent `:active_user_count` usage log entry across all
  tenants. `Lotta.Tenants.create_active_user_count_log/1` is run daily for
  every tenant (see `Lotta.Worker.Tenant`'s `collect_daily_usage_logs` job),
  so this reuses that existing per-tenant aggregation rather than scanning
  every tenant schema directly.
  """
  def count_active_users do
    sum_latest_usage_log_value(:active_user_count)
  end

  @doc """
  Sums the most recent `:total_storage_count` usage log entry (bytes) across
  all tenants. See `count_active_users/0` for why this reads from
  `usage_logs` instead of querying each tenant schema directly.
  """
  def total_storage_bytes do
    sum_latest_usage_log_value(:total_storage_count)
  end

  defp sum_latest_usage_log_value(type) do
    latest_date =
      UsageLog
      |> where([u], u.type == ^type)
      |> select([u], max(u.date))
      |> Repo.one(prefix: "public")

    if is_nil(latest_date) do
      0
    else
      UsageLog
      |> where([u], u.type == ^type and u.date == ^latest_date)
      |> select([u], sum(fragment("?::bigint", u.value)))
      |> Repo.one(prefix: "public")
      |> Kernel.||(0)
    end
  end
end
