defmodule LottaWeb.Live.InvoiceLive do
  alias Lotta.Billings.Invoice

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
    ~H"""
    <iframe
      src={get_html_src(@item)}
      onLoad="this.style.height=this.contentWindow.document.body.scrollHeight +'px';"
      style="width: min(80%, 794px); aspect-ratio: 210 / 297; border: none; zoom: .75; padding: 1em;"
    />
    """
  end

  defp get_html_src(%Invoice{} = invoice) do
    invoice = Lotta.Repo.preload(invoice, :items)
    "data:text/html;base64,#{Base.encode64(Invoice.to_html(invoice))}"
  end
end
