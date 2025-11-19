defmodule Lotta.Tenants.UsageLog do
  @moduledoc """
  Ecto Schema for usage logs
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false
  schema "usage_logs" do
    field(:value, :string)

    field(:type, Ecto.Enum,
      values: [:active_user_count, :total_storage_count, :media_conversion_seconds]
    )

    field(:date, :date)
    field(:unique_identifier, :string)

    belongs_to(:tenant, Lotta.Tenants.Tenant)

    timestamps()
  end

  @doc """
  Changeset for creating or updating usage logs.
  """
  def changeset(usage_log, attrs) do
    usage_log
    |> cast(attrs, [:value, :type, :date, :unique_identifier, :tenant_id])
    |> validate_required([:value, :type, :date, :tenant_id])
    |> unique_constraint([:tenant_id, :unique_identifier],
      name: :usage_logs_tenant_id_unique_identifier_index
    )
  end
end
