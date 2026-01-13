defmodule Lotta.Billings.EpcCode do
  @moduledoc """
  Provides functionality to create an [EpcCode](https://en.wikipedia.org/wiki/EPC_QR_code)
  """
  alias QRCode.Render.SvgSettings

  defstruct recipient: "",
            iban: "",
            bic: "",
            purpose: "",
            amount: Decimal.from_float(0.0),
            currency: "EUR"

  @type t() :: %__MODULE__{
          recipient: String.t(),
          iban: String.t(),
          bic: String.t(),
          purpose: String.t(),
          amount: Decimal.t(),
          currency: String.t()
        }

  @typep properties :: [
           {:recipient, String.t()}
           | {:iban, String.t()}
           | {:bic, String.t()}
           | {:amount, Decimal.t()}
           | {:currency, String.t()}
           | {:purpose, String.t()}
         ]

  @doc """
  Create a new instance of an epc code.
  """
  @spec new(properties()) :: t()
  def new(properties), do: struct(__MODULE__, properties)

  @doc """
  Generate the SVG representation of the EPC QR code.
  """
  @spec to_svg(epc_code :: t(), svg_settings :: SvgSettings.t() | nil) ::
          String.t()
  def to_svg(%__MODULE__{} = epc_code, svg_settings \\ %SvgSettings{}) do
    result =
      epc_code
      |> generate_content()
      |> QRCode.create(:high)
      |> QRCode.render(:svg, svg_settings)

    with {:ok, svg} <- result do
      set_svg_viewbox(svg)
    end
  end

  defp set_svg_viewbox(svg) do
    regex = ~r/width="(\d+)" height="(\d+)"/

    svg
    |> String.replace(
      regex,
      ~s(width="\\1" height="\\2" viewBox="0 0 \\1 \\2")
    )
  end

  defp generate_content(%__MODULE__{
         recipient: recipient,
         iban: iban,
         bic: bic,
         purpose: purpose,
         amount: amount,
         currency: currency
       }) do
    [
      "BCD",
      "001",
      "1",
      "SCT",
      bic,
      recipient,
      iban,
      "#{currency}#{Decimal.to_string(amount, :normal)}",
      "",
      "",
      purpose
    ]
    |> Enum.join("\n")
  end
end
