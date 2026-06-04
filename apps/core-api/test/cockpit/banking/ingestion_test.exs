defmodule Cockpit.Banking.IngestionTest do
  @moduledoc false

  use Lotta.DataCase, async: true

  alias Cockpit.Banking.Ingestion

  describe "parse_date/1" do
    test "returns nil for nil" do
      assert Ingestion.parse_date(nil) == nil
    end

    test "returns nil for empty string" do
      assert Ingestion.parse_date("") == nil
    end

    test "parses YYYYMMDD format" do
      assert Ingestion.parse_date("20251101") == ~D[2025-11-01]
    end

    test "returns nil for invalid format" do
      assert Ingestion.parse_date("2025-11-01") == nil
      assert Ingestion.parse_date("short") == nil
    end
  end

  describe "parse_value/1" do
    test "returns zero EUR for nil" do
      {amount, currency} = Ingestion.parse_value(nil)
      assert Decimal.equal?(amount, Decimal.new(0))
      assert currency == "EUR"
    end

    test "returns zero EUR for empty string" do
      {amount, currency} = Ingestion.parse_value("")
      assert Decimal.equal?(amount, Decimal.new(0))
      assert currency == "EUR"
    end

    test "parses URL-encoded fraction with currency" do
      {amount, currency} = Ingestion.parse_value("7467%2F10%3AEUR")
      assert Decimal.equal?(amount, Decimal.new("746.7"))
      assert currency == "EUR"
    end

    test "parses negative value" do
      {amount, _currency} = Ingestion.parse_value("-15000%2F100%3AEUR")
      assert Decimal.equal?(amount, Decimal.new("-150.00"))
    end

    test "parses value without explicit currency" do
      {amount, currency} = Ingestion.parse_value("500%2F100")
      assert Decimal.equal?(amount, Decimal.new("5.00"))
      assert currency == "EUR"
    end

    test "parses whole number value" do
      {amount, currency} = Ingestion.parse_value("100%3AEUR")
      assert Decimal.equal?(amount, Decimal.new("100"))
      assert currency == "EUR"
    end
  end

  describe "decode_string/1" do
    test "returns nil for nil" do
      assert Ingestion.decode_string(nil) == nil
    end

    test "returns empty string for empty string" do
      assert Ingestion.decode_string("") == ""
    end

    test "decodes URL-encoded characters" do
      assert Ingestion.decode_string("F%C3%B6rderverein") == "Förderverein"
    end

    test "decodes URL-encoded spaces" do
      assert Ingestion.decode_string("Test%20GmbH") == "Test GmbH"
    end

    test "returns plain strings unchanged" do
      assert Ingestion.decode_string("Plaintext") == "Plaintext"
    end
  end

  describe "parse_balance/2" do
    test "parses a balance entry" do
      balance_data = %{
        "type" => "booked",
        "date" => "20251101",
        "value" => "74670%2F100%3AEUR"
      }

      result = Ingestion.parse_balance(balance_data, "DE24430609671310166000")

      assert result.iban == "DE24430609671310166000"
      assert result.date == ~D[2025-11-01]
      assert Decimal.equal?(result.value, Decimal.new("746.70"))
      assert result.currency == "EUR"
      assert result.balance_type == "booked"
    end
  end

  describe "parse_transaction/2" do
    test "parses a transaction entry" do
      transaction_data = %{
        "date" => "20251025",
        "valutaDate" => "20251025",
        "value" => "-15000%2F100%3AEUR",
        "localBankCode" => "43060967",
        "localAccountNumber" => "1310166000",
        "remoteIban" => "DE12345678901234567890",
        "remoteName" => "Test%20GmbH",
        "purpose" => "Invoice%20payment"
      }

      result = Ingestion.parse_transaction(transaction_data, "DE24430609671310166000")

      assert result.iban == "DE24430609671310166000"
      assert result.transaction_date == ~D[2025-10-25]
      assert result.valuta_date == ~D[2025-10-25]
      assert Decimal.equal?(result.amount, Decimal.new("-150.00"))
      assert result.currency == "EUR"
      assert result.local_bank_code == "43060967"
      assert result.local_account_number == "1310166000"
      assert result.remote_iban == "DE12345678901234567890"
      assert result.remote_name == "Test GmbH"
      assert result.purpose == "Invoice payment"
    end

    test "handles nil optional fields" do
      transaction_data = %{
        "date" => "20251025",
        "valutaDate" => "20251025",
        "value" => "10000%2F100%3AEUR"
      }

      result = Ingestion.parse_transaction(transaction_data, "DE24430609671310166000")

      assert result.remote_name == nil
      assert result.purpose == nil
      assert result.primanota == nil
    end
  end

  describe "insert_balance/1" do
    test "inserts a valid balance" do
      attrs = %{
        iban: "DE24430609671310166000",
        date: ~D[2025-11-01],
        value: Decimal.new("746.70"),
        currency: "EUR",
        balance_type: "booked"
      }

      assert {:ok, :inserted} = Ingestion.insert_balance(attrs)
    end

    test "skips duplicate balance (same iban, date, type)" do
      attrs = %{
        iban: "DE24430609671310166000",
        date: ~D[2025-11-01],
        value: Decimal.new("746.70"),
        currency: "EUR",
        balance_type: "booked"
      }

      assert {:ok, :inserted} = Ingestion.insert_balance(attrs)
      assert {:ok, :skipped} = Ingestion.insert_balance(attrs)
    end

    test "allows same iban/date with different balance_type" do
      base = %{
        iban: "DE24430609671310166000",
        date: ~D[2025-11-01],
        value: Decimal.new("746.70"),
        currency: "EUR"
      }

      assert {:ok, :inserted} = Ingestion.insert_balance(Map.put(base, :balance_type, "booked"))
      assert {:ok, :inserted} = Ingestion.insert_balance(Map.put(base, :balance_type, "noted"))
    end

    test "returns error for invalid balance_type" do
      attrs = %{
        iban: "DE24430609671310166000",
        date: ~D[2025-11-01],
        value: Decimal.new("746.70"),
        currency: "EUR",
        balance_type: "unknown"
      }

      assert {:error, changeset} = Ingestion.insert_balance(attrs)
      assert %{balance_type: _} = errors_on(changeset)
    end
  end

  describe "insert_transaction/1" do
    test "inserts a valid transaction" do
      attrs = %{
        iban: "DE24430609671310166000",
        transaction_date: ~D[2025-10-25],
        valuta_date: ~D[2025-10-25],
        amount: Decimal.new("-150.00"),
        currency: "EUR",
        local_account_number: "1310166000",
        remote_iban: "DE12345678901234567890",
        purpose: "Invoice payment"
      }

      assert {:ok, :inserted} = Ingestion.insert_transaction(attrs)
    end

    test "skips duplicate transaction" do
      attrs = %{
        iban: "DE24430609671310166000",
        transaction_date: ~D[2025-10-25],
        valuta_date: ~D[2025-10-25],
        amount: Decimal.new("-150.00"),
        currency: "EUR",
        local_account_number: "1310166000",
        remote_iban: "DE12345678901234567890",
        purpose: "Invoice payment"
      }

      assert {:ok, :inserted} = Ingestion.insert_transaction(attrs)
      assert {:ok, :skipped} = Ingestion.insert_transaction(attrs)
    end
  end

  describe "process_account_info/1" do
    test "processes balances and transactions and returns counts" do
      account_info = %{
        "iban" => "DE24430609671310166000",
        "balance" => [
          %{"type" => "booked", "date" => "20251101", "value" => "74670%2F100%3AEUR"},
          %{"type" => "noted", "date" => "20251101", "value" => "74670%2F100%3AEUR"}
        ],
        "transaction" => [
          %{
            "date" => "20251025",
            "valutaDate" => "20251025",
            "value" => "-15000%2F100%3AEUR",
            "localAccountNumber" => "1310166000",
            "remoteIban" => "DE12345678901234567890",
            "purpose" => "Payment 1"
          }
        ]
      }

      result = Ingestion.process_account_info(account_info)

      assert result.balances.inserted == 2
      assert result.balances.skipped == 0
      assert result.transactions.inserted == 1
      assert result.transactions.skipped == 0
    end

    test "counts skipped records on second run" do
      account_info = %{
        "iban" => "DE24430609671310166000",
        "balance" => [
          %{"type" => "booked", "date" => "20251101", "value" => "74670%2F100%3AEUR"}
        ],
        "transaction" => []
      }

      Ingestion.process_account_info(account_info)
      result = Ingestion.process_account_info(account_info)

      assert result.balances.inserted == 0
      assert result.balances.skipped == 1
    end

    test "handles account with no balance or transactions" do
      account_info = %{"iban" => "DE24430609671310166000"}

      result = Ingestion.process_account_info(account_info)

      assert result == %{
               balances: %{inserted: 0, skipped: 0},
               transactions: %{inserted: 0, skipped: 0}
             }
    end
  end
end
