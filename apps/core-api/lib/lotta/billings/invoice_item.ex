defmodule Lotta.Billings.InvoiceItem do
  @moduledoc """
  Schema for invoice items
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Lotta.Billings.Invoice

  @type t() :: %__MODULE__{
          id: pos_integer(),
          invoice_id: pos_integer(),
          invoice: Invoice.t() | Ecto.Association.NotLoaded.t(),
          type: String.t(),
          period_start: Date.t(),
          period_end: Date.t(),
          rows: map(),
          amount: Decimal.t(),
          notes: String.t() | nil
        }

  schema "invoice_items" do
    field(:type, :string)

    field(:period_start, :date)
    field(:period_end, :date)

    field(:rows, {:array, :map}, default: [])
    field(:amount, :decimal)
    field(:notes, :string)

    belongs_to(:invoice, Invoice)

    timestamps()
  end

  @doc """
  Changeset for creating a new invoice item.
  """
  @spec create_changeset(t(), map()) :: Ecto.Changeset.t()
  def create_changeset(invoice_item \\ %__MODULE__{}, attrs) do
    invoice_item
    |> cast(attrs, [
      :invoice_id,
      :type,
      :period_start,
      :period_end,
      :rows,
      :amount,
      :notes
    ])
    |> validate_required([:type, :period_start, :period_end, :rows, :amount])
    |> validate_number(:amount, greater_than_or_equal_to: 0)
    |> foreign_key_constraint(:invoice_id)
  end
end
