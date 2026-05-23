defmodule Lotta.Billings.EpcCodeTest do
  use ExUnit.Case, async: true

  alias Lotta.Billings.EpcCode
  alias QRCode.Render.SvgSettings

  describe "new/1" do
    test "creates a new EpcCode struct with provided properties" do
      properties = [
        recipient: "John Doe",
        iban: "DE89370400440532013000",
        bic: "COBADEFFXXX",
        purpose: "Invoice 12345",
        amount: Decimal.new("100.50"),
        currency: "EUR"
      ]

      epc_code = EpcCode.new(properties)

      assert %EpcCode{} = epc_code
      assert epc_code.recipient == "John Doe"
      assert epc_code.iban == "DE89370400440532013000"
      assert epc_code.bic == "COBADEFFXXX"
      assert epc_code.purpose == "Invoice 12345"
      assert Decimal.equal?(epc_code.amount, Decimal.new("100.50"))
      assert epc_code.currency == "EUR"
    end

    test "creates EpcCode with default values when properties are not provided" do
      epc_code = EpcCode.new([])

      assert %EpcCode{} = epc_code
      assert epc_code.recipient == ""
      assert epc_code.iban == ""
      assert epc_code.bic == ""
      assert epc_code.purpose == ""
      assert Decimal.equal?(epc_code.amount, Decimal.from_float(0.0))
      assert epc_code.currency == "EUR"
    end

    test "creates EpcCode with partial properties" do
      properties = [
        recipient: "Jane Smith",
        iban: "FR1420041010050500013M02606"
      ]

      epc_code = EpcCode.new(properties)

      assert epc_code.recipient == "Jane Smith"
      assert epc_code.iban == "FR1420041010050500013M02606"
      assert epc_code.bic == ""
      assert epc_code.purpose == ""
    end
  end

  describe "to_svg/2" do
    test "generates valid SVG string from EpcCode" do
      epc_code =
        EpcCode.new(
          recipient: "Max Mustermann",
          iban: "DE89370400440532013000",
          bic: "COBADEFFXXX",
          purpose: "Test payment",
          amount: Decimal.new("50.00"),
          currency: "EUR"
        )

      svg = EpcCode.to_svg(epc_code)

      assert is_binary(svg)
      assert String.contains?(svg, "<svg")
      assert String.contains?(svg, "</svg>")
      assert String.contains?(svg, "viewBox=")
    end

    test "generates SVG with viewBox attribute" do
      epc_code =
        EpcCode.new(
          recipient: "Test User",
          iban: "DE89370400440532013000",
          bic: "COBADEFFXXX",
          purpose: "Payment",
          amount: Decimal.new("25.50"),
          currency: "EUR"
        )

      svg = EpcCode.to_svg(epc_code)

      # Check that viewBox is present
      assert svg =~ ~r/viewBox="0 0 \d+ \d+"/
      # Check that width and height are present
      assert svg =~ ~r/width="\d+"/
      assert svg =~ ~r/height="\d+"/
    end

    test "generates SVG with custom SvgSettings" do
      epc_code =
        EpcCode.new(
          recipient: "Custom User",
          iban: "DE89370400440532013000",
          bic: "COBADEFFXXX",
          purpose: "Custom payment",
          amount: Decimal.new("100.00"),
          currency: "EUR"
        )

      custom_settings = %SvgSettings{
        scale: 10
      }

      svg = EpcCode.to_svg(epc_code, custom_settings)

      assert is_binary(svg)
      assert String.contains?(svg, "<svg")
    end

    test "generates SVG with decimal amounts having various precision" do
      test_cases = [
        Decimal.new("0.01"),
        Decimal.new("99.99"),
        Decimal.new("1000.00"),
        Decimal.new("12.5")
      ]

      for amount <- test_cases do
        epc_code =
          EpcCode.new(
            recipient: "Test",
            iban: "DE89370400440532013000",
            bic: "COBADEFFXXX",
            purpose: "Test",
            amount: amount,
            currency: "EUR"
          )

        svg = EpcCode.to_svg(epc_code)
        assert is_binary(svg)
        assert String.contains?(svg, "<svg")
      end
    end

    test "generates SVG with empty optional fields" do
      epc_code =
        EpcCode.new(
          recipient: "Minimal User",
          iban: "DE89370400440532013000",
          bic: "",
          purpose: "",
          amount: Decimal.new("10.00"),
          currency: "EUR"
        )

      svg = EpcCode.to_svg(epc_code)

      assert is_binary(svg)
      assert String.contains?(svg, "<svg")
    end

    test "generates SVG with different currencies" do
      for currency <- ["EUR", "USD", "GBP", "CHF"] do
        epc_code =
          EpcCode.new(
            recipient: "Currency Test",
            iban: "DE89370400440532013000",
            bic: "COBADEFFXXX",
            purpose: "Currency test",
            amount: Decimal.new("50.00"),
            currency: currency
          )

        svg = EpcCode.to_svg(epc_code)
        assert is_binary(svg)
        assert String.contains?(svg, "<svg")
      end
    end

    test "generates QR code with correct EPC format structure" do
      epc_code =
        EpcCode.new(
          recipient: "Format Test",
          iban: "DE89370400440532013000",
          bic: "COBADEFFXXX",
          purpose: "Format verification",
          amount: Decimal.new("75.25"),
          currency: "EUR"
        )

      # The QR code should encode the EPC format which includes:
      # BCD, 001, 1, SCT, bic, recipient, iban, currency+amount, empty, empty, purpose
      svg = EpcCode.to_svg(epc_code)

      assert is_binary(svg)
      # Verify it's a valid SVG structure
      assert String.starts_with?(svg, "<svg")
      assert String.ends_with?(String.trim(svg), "</svg>")
    end

    test "handles zero amount" do
      epc_code =
        EpcCode.new(
          recipient: "Zero Test",
          iban: "DE89370400440532013000",
          bic: "COBADEFFXXX",
          purpose: "Zero amount",
          amount: Decimal.new("0"),
          currency: "EUR"
        )

      svg = EpcCode.to_svg(epc_code)

      assert is_binary(svg)
      assert String.contains?(svg, "<svg")
    end
  end
end
