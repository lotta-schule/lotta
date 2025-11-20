defmodule LottaWeb.Live.InvoiceLive do
  use Backpex.LiveResource,
    adapter_config: [
      schema: Lotta.Billings.Invoice,
      repo: Lotta.Repo
    ],
    layout: {LottaWeb.Layouts, :admin}

  import Ecto.Query, only: [fragment: 1, dynamic: 2]

  @impl Backpex.LiveResource
  def can?(_, action, _) do
    action in [:index, :show]
  end

  @impl Backpex.LiveResource
  def singular_name, do: "Invoice"

  @impl Backpex.LiveResource
  def plural_name, do: "Invoices"

  @impl Backpex.LiveResource
  def fields do
    [
      invoice_number: %{
        module: Backpex.Fields.Text,
        label: "Invoice Number",
        readonly: true
      },
      period: %{
        module: Backpex.Fields.Text,
        label: "Period",
        select: dynamic([invoice: i], fragment("date_trunc('month', ?)::date", i.period_start))
      },
      customer_no: %{
        module: Backpex.Fields.Text,
        label: "Customer Number"
      },
      total: %{
        module: Backpex.Fields.Currency,
        label: "Amount",
        unit: "EUR",
        radix: ",",
        thousands_separator: " "
      },
      issued_at: %{
        module: Backpex.Fields.DateTime,
        label: "Issued At",
        readonly: true
      },
      due_date: %{
        module: Backpex.Fields.Date,
        label: "Due Date",
        readonly: true
      },
      paid_at: %{
        module: Backpex.Fields.DateTime,
        label: "Paid At",
        readonly: true
      }
    ]
  end

  @impl Backpex.LiveResource
  def render_resource_slot(assigns, :show, :main) do
    IO.inspect(assigns)

    ~H"""
    <iframe
      src="https://google.com"
      class="w-full h-min border-0"
    />
    """
  end
end
