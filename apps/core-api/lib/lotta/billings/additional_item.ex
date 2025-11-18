defmodule Lotta.Billings.AdditionalItem do
  @moduledoc """
  Schema for additional billable items that can be assigned to tenants.

  Examples include custom services like email hosting, premium support,
  or any other recurring charges beyond the base plan.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Lotta.Tenants.Tenant

  @type t() :: %__MODULE__{
          id: pos_integer(),
          name: String.t(),
          description: String.t(),
          valid_from: Date.t() | nil,
          valid_until: Date.t() | nil,
          price: Decimal.t(),
          tenant_id: pos_integer(),
          tenant: Tenant.t() | Ecto.Association.NotLoaded.t()
        }

  schema "additional_items" do
    field(:name, :string)
    field(:description, :string, default: "")
    field(:valid_from, :date)
    field(:valid_until, :date)
    field(:price, :decimal)

    belongs_to(:tenant, Tenant)

    timestamps()
  end

  @doc """
  Changeset for creating or updating an additional item.
  """
  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(additional_item, attrs) do
    additional_item
    |> cast(attrs, [:name, :description, :valid_from, :valid_until, :price, :tenant_id])
    |> validate_required([:name, :price, :tenant_id])
    |> validate_length(:name, min: 1)
    |> validate_number(:price, greater_than_or_equal_to: 0)
    |> validate_date_range()
    |> foreign_key_constraint(:tenant_id)
  end

  # Validates that valid_until is after valid_from when both are present
  defp validate_date_range(changeset) do
    valid_from = get_field(changeset, :valid_from)
    valid_until = get_field(changeset, :valid_until)

    case {valid_from, valid_until} do
      {nil, _} ->
        changeset

      {_, nil} ->
        changeset

      {from_date, until_date} ->
        if Date.compare(until_date, from_date) in [:gt, :eq] do
          changeset
        else
          add_error(changeset, :valid_until, "must be on or after valid_from date")
        end
    end
  end
end
