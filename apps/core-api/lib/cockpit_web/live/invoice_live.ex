defmodule CockpitWeb.Live.InvoiceLive do
  alias Lotta.Billings.Invoice

  use Backpex.LiveResource,
    adapter_config: [
      schema: Lotta.Billings.Invoice,
      repo: Lotta.Repo
    ],
    layout: {CockpitWeb.Layouts, :admin}

  import Ecto.Query

  @impl Backpex.LiveResource
  def can?(_, _, %{issued_at: nil}), do: true
  def can?(_, action, _invoice) when action in [:edit, :delete, :issue], do: false
  def can?(_, _, _), do: true

  @impl Backpex.LiveResource
  def singular_name, do: "Invoice"

  @impl Backpex.LiveResource
  def plural_name, do: "Invoices"

  @impl Backpex.LiveResource
  def fields do
    [
      tenant: %{
        module: Backpex.Fields.BelongsTo,
        label: "Tenant",
        display_field: :title,
        live_resource: CockpitWeb.Live.TenantLive
      },
      invoice_number: %{
        module: Backpex.Fields.Text,
        label: "Invoice Number",
        readonly: true
      },
      period: %{
        module: Backpex.Fields.Text,
        label: "Period",
        select: dynamic([invoice: i], fragment("date_trunc('month', ?)::date", i.period_start)),
        readonly: true
      },
      customer_no: %{
        module: Backpex.Fields.Text,
        label: "Customer Number",
        readonly: true
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
        readonly: true,
        visible: fn %{item: %{issued_at: issued_at}} -> not is_nil(issued_at) end
      },
      due_date: %{
        module: Backpex.Fields.Date,
        label: "Due Date",
        visible: fn %{item: %{issued_at: issued_at}} -> not is_nil(issued_at) end
      },
      paid_at: %{
        module: Backpex.Fields.DateTime,
        label: "Paid At",
        readonly: true,
        visible: fn %{item: %{issued_at: issued_at}} -> not is_nil(issued_at) end
      }
    ]
  end

  @impl Backpex.LiveResource
  def item_actions([show, edit, _delete]) do
    [
      show,
      edit,
      issue: %{
        module: CockpitWeb.ItemActions.IssueInvoice,
        only: [:row, :show]
      }
    ]
  end

  @impl Backpex.LiveResource
  def render_resource_slot(%{item: %{issued_at: nil}} = assigns, :show, :main) do
    ~H"""
    <iframe
      src={get_html_src(@item)}
      onLoad="this.style.height=this.contentWindow.document.body.scrollHeight +'px';"
      style="width: min(80%, 794px); aspect-ratio: 210 / 297; border: none; zoom: .75; padding: 1em;"
    />
    """
  end

  def render_resource_slot(%{item: item} = assigns, :show, :main) do
    assigns = Map.put(assigns, :pdf_src, get_pdf_src(item))

    ~H"""
    <iframe
      src={@pdf_src}
      style="width: min(80%, 794px); border: none; zoom: .75; padding: 1em;"
    />
    <a
      :if={String.starts_with?(@pdf_src, "data:application")}
      href={@pdf_src}
      download={@item.invoice_number <> ".pdf"}
    >
      Download PDF
    </a>
    """
  end

  defp get_html_src(%Invoice{} = invoice) do
    invoice = Lotta.Repo.preload(invoice, :items)
    "data:text/html;base64,#{Base.encode64(Invoice.to_html(invoice))}"
  end

  defp get_pdf_src(%Invoice{} = invoice) do
    if Keyword.get(Application.get_env(:lotta, ChromicPDF), :disabled, false) do
      get_html_src(invoice)
    else
      invoice = Lotta.Repo.preload(invoice, :items)
      "data:application/pdf;base64,#{Base.encode64(Invoice.to_pdf(invoice))}"
    end
  end
end
