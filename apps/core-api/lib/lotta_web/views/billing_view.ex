defmodule LottaWeb.BillingView do
  @moduledoc """
  View with helpers for billing / invoices
  """
  alias Lotta.Billings.EpcCode

  use LottaWeb, :view

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
