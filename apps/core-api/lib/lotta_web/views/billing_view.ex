defmodule LottaWeb.BillingView do
  @moduledoc """
  View with helpers for billing / invoices
  """
  alias Lotta.Billings.EpcCode

  use LottaWeb, :view

  def invoice_footer do
    """
    <style>
      :root {
        --color-text: #333;
        --color-primary: #ab0001;
        --color-secondary: #aaa;
      }
      * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
      }

      body {
          font-family: Arial, sans-serif;
          font-size: 9pt;
          line-height: 1.3;
          color: var(--color-text)
          background: white;
      }

      footer {
        width: 100%;
          border-top: 1px solid #ddd;
          display: flex;
          flex-direction: column;
          padding: 0 15mm;
      }
      .footer {
          display: flex;
          padding-top: 10px;
          width: 100%;
          justify-content: space-between;
          font-size: 7pt;
          color: var(--color-secondary);
      }

      .footer-column:nth-child(1) {
          text-align: left;
      }
      .footer-column:nth-child(2) {
          text-align: center;
      }
      .footer-column:nth-child(3) {
          text-align: right;
      }

      .page-number {
          text-align: right;
          font-size: 8pt;
          color: var(--color-secondary);
          margin-top: 20px;
      }
    </style>
    <footer>
      <div class="footer">
        <div class="footer-column">
          <p>einsA GbR</p>
          <p>Wilhelminenstraße 10</p>
          <p>04129 Leipzig</p>
        </div>
        <div class="footer-column">
          <p>Geschäftsführer: Eike Wiewiorra</p>
          <p>Ust.ID: DE 311 605 299</p>
          <p>email: kontakt@lotta.schule</p>
        </div>
        <div class="footer-column">
          <p>Konto: GLS-Bank</p>
          <p>BIC: GENODEM1GLS</p>
          <p>IBAN: DE24 4306 0967 1310 1660 00</p>
        </div>
      </div>

      <div class="page-number">
        Seite <span class="pageNumber"></span>/<span class="totalPages"></span>
      </div>
    </footer>
    """
  end

  defp get_row_value(%{"type" => type, "metadata" => metadata}, :used_quantity)
       when type in ["storage_usage", "media_conversion_usage"] do
    rounded(metadata["storage_included_gb"] || metadata["conversion_included_minutes"])
  end

  defp get_row_value(row, :used_quantity), do: row["quantity"]

  defp get_row_value(%{"type" => type}, :unit_price)
       when type in ["storage_usage", "media_conversion_usage"],
       do: format_price(Decimal.from_float(0.0))

  defp get_row_value(row, :unit_price), do: format_price(row["unit_price"])

  defp get_row_value(%{"metadata" => metadata}, :overage_amount),
    do: rounded(metadata["storage_overage_gb"] || metadata["conversion_overage_minutes"])

  defp get_row_value(%{"type" => type} = row, :overage_price)
       when type in ["storage_usage", "media_conversion_usage"],
       do: format_price(row["unit_price"])

  defp get_row_value(row, :price), do: format_price(row["amount"])
  defp get_row_value(_, _), do: nil

  defp format_price(%Decimal{} = price),
    do: Decimal.round(price, 2) |> to_string() |> format_price()

  defp format_price(price) when is_float(price),
    do: price |> Decimal.from_float() |> format_price()

  defp format_price(value) when is_binary(value), do: "#{value} €"
  defp format_price(value), do: value

  defp rounded(%Decimal{} = value), do: Decimal.round(value, 0)

  defp rounded(value) when is_float(value),
    do: value |> Float.round(0) |> trunc()

  defp rounded(value), do: value

  defp default_logo_data_url() do
    Application.app_dir(:lotta, "priv/static/lotta.png")
    |> File.read()
    |> case do
      {:ok, binary} ->
        "data:image/png;base64,#{Base.encode64(binary)}"

      {:error, _} ->
        ""
    end
  end

  defp payment_qr(invoice) do
    properties =
      Application.get_env(:lotta, Lotta.Billings)
      |> Keyword.take([:recipient, :iban, :bic])
      |> Keyword.put(:purpose, "Lotta Rechnungsnummer #{invoice.invoice_number}")
      |> Keyword.put(:amount, invoice.total)

    properties
    |> EpcCode.new()
    |> EpcCode.to_svg()
  end
end
