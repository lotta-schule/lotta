defmodule Lotta.Billings.Invoice do
  @moduledoc """
  Schema for invoices issued to tenants for their subscription and usage.

  Invoices are generated monthly and include:
  - Base plan charges
  - Additional items (email services, premium features, etc.)
  - Any usage overages (if applicable)
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias LottaWeb.BillingView
  alias Lotta.Billings.InvoiceItem
  alias Lotta.Tenants.Tenant

  @type status :: :draft | :issued | :paid | :overdue | :cancelled

  @type t() :: %__MODULE__{
          id: pos_integer(),
          invoice_number: String.t(),
          year: pos_integer(),
          month: pos_integer(),
          period_start: Date.t(),
          period_end: Date.t(),
          issued_at: DateTime.t() | nil,
          due_date: Date.t() | nil,
          paid_at: DateTime.t() | nil,
          status: status(),
          items: [InvoiceItem.t()] | Ecto.Association.NotLoaded.t(),
          total: Decimal.t(),
          notes: String.t() | nil,
          customer_name: String.t() | nil,
          customer_address: String.t() | nil,
          customer_no: String.t() | nil,
          customer_contact_name: String.t() | nil,
          customer_contact_email: String.t() | nil,
          customer_contact_phone: String.t() | nil,
          tenant_id: pos_integer(),
          tenant: Tenant.t() | Ecto.Association.NotLoaded.t()
        }

  schema "invoices" do
    field(:invoice_number, :string)
    field(:year, :integer)
    field(:month, :integer)
    field(:period_start, :date)
    field(:period_end, :date)
    field(:issued_at, :utc_datetime)
    field(:due_date, :date)
    field(:paid_at, :utc_datetime)

    field(:status, Ecto.Enum,
      values: [:draft, :issued, :paid, :overdue, :cancelled],
      default: :draft
    )

    field(:total, :decimal)
    field(:notes, :string)

    # Customer information (copied from tenant at invoice creation)
    field(:customer_name, :string)
    field(:customer_address, :string)
    field(:customer_no, :string)
    field(:customer_contact_name, :string)
    field(:customer_contact_email, :string)
    field(:customer_contact_phone, :string)

    belongs_to(:tenant, Tenant)
    has_many(:items, InvoiceItem)

    timestamps()
  end

  @doc """
  Changeset for creating a new invoice.
  """
  @spec create_changeset(map()) :: Ecto.Changeset.t()
  def create_changeset(attrs) do
    %__MODULE__{}
    |> cast(attrs, [
      :invoice_number,
      :tenant_id,
      :year,
      :month,
      :period_start,
      :period_end,
      :total,
      :status,
      :notes,
      :customer_name,
      :customer_address,
      :customer_no,
      :customer_contact_name,
      :customer_contact_email,
      :customer_contact_phone
    ])
    |> cast_assoc(:items, with: &InvoiceItem.create_changeset/2)
    |> validate_required([
      :invoice_number,
      :tenant_id,
      :year,
      :month,
      :period_start,
      :period_end,
      :total
    ])
    |> validate_number(:year, greater_than_or_equal_to: 2025)
    |> validate_number(:month, greater_than_or_equal_to: 1, less_than_or_equal_to: 12)
    |> validate_number(:total, greater_than_or_equal_to: 0)
    |> validate_items_present()
    |> validate_period_dates()
    |> unique_constraint(:invoice_number)
    |> unique_constraint([:tenant_id, :year, :month])
    |> foreign_key_constraint(:tenant_id)
  end

  @doc """
  Changeset for updating invoice status and payment information.
  """
  @spec update_changeset(t(), map()) :: Ecto.Changeset.t()
  def update_changeset(invoice, attrs) do
    invoice
    |> cast(attrs, [:status, :issued_at, :due_date, :paid_at, :notes])
    |> validate_required_dates_for_status()
  end

  # Validates that at least one item is present
  defp validate_items_present(changeset) do
    # Get items from changes (for new records) or from the struct (for updates)
    items =
      case get_change(changeset, :items) do
        nil -> get_field(changeset, :items) || []
        changes -> changes
      end

    if length(items) < 1 do
      add_error(changeset, :items, "must have at least one item")
    else
      changeset
    end
  end

  def to_html(%__MODULE__{} = invoice) do
    Phoenix.Template.render_to_string(
      LottaWeb.BillingView,
      "invoice",
      "html",
      invoice: invoice
    )
  end

  def to_pdf(%__MODULE__{} = invoice) do
    html = to_html(invoice)

    {:ok, pdf} =
      ChromicPDF.print_to_pdf({:html, html},
        print_to_pdf: %{
          displayHeaderFooter: true,
          footerTemplate: BillingView.invoice_footer(),
          headerTemplate: "<span></span>"
        }
      )

    pdf
  end

  # Validates that period_start is the first day of the month
  # and period_end is the last day of the month
  defp validate_period_dates(changeset) do
    year = get_field(changeset, :year)
    month = get_field(changeset, :month)
    period_start = get_field(changeset, :period_start)
    period_end = get_field(changeset, :period_end)

    if year && month && period_start && period_end do
      expected_start = Date.new!(year, month, 1)
      expected_end = Date.end_of_month(expected_start)

      cond do
        Date.compare(period_start, expected_start) != :eq ->
          add_error(changeset, :period_start, "must be the first day of the month")

        Date.compare(period_end, expected_end) != :eq ->
          add_error(changeset, :period_end, "must be the last day of the month")

        true ->
          changeset
      end
    else
      changeset
    end
  end

  # Validates that required dates are set based on status
  defp validate_required_dates_for_status(changeset) do
    status = get_field(changeset, :status)

    case status do
      :draft ->
        changeset

      :paid ->
        changeset
        |> validate_required([:issued_at, :due_date, :paid_at])

      status when status in [:issued, :overdue] ->
        changeset
        |> validate_required([:issued_at, :due_date])

      _ ->
        changeset
    end
  end
end
