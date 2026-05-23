defmodule Cockpit.BankingTest do
  @moduledoc false

  use Lotta.DataCase

  alias Cockpit.Banking
  alias Cockpit.Banking.Ingestion

  @iban "DE24430609671310166000"
  @other_iban "DE89370400440532013000"

  defp insert_balance!(attrs \\ %{}) do
    defaults = %{
      iban: @iban,
      date: ~D[2025-11-01],
      value: Decimal.new("746.70"),
      currency: "EUR",
      balance_type: "booked"
    }

    {:ok, :inserted} = Ingestion.insert_balance(Map.merge(defaults, attrs))
  end

  defp insert_transaction!(attrs \\ %{}) do
    defaults = %{
      iban: @iban,
      transaction_date: ~D[2025-10-25],
      valuta_date: ~D[2025-10-25],
      amount: Decimal.new("-150.00"),
      currency: "EUR",
      local_account_number: "1310166000",
      purpose: "Test payment"
    }

    {:ok, :inserted} = Ingestion.insert_transaction(Map.merge(defaults, attrs))
  end

  describe "ingest_account_data/1" do
    test "returns ok with stats on success" do
      data = %{
        "accountInfo" => [
          %{
            "iban" => @iban,
            "balance" => [
              %{"type" => "booked", "date" => "20251101", "value" => "74670%2F100%3AEUR"}
            ],
            "transaction" => [
              %{
                "date" => "20251025",
                "valutaDate" => "20251025",
                "value" => "-15000%2F100%3AEUR",
                "localAccountNumber" => "1310166000",
                "purpose" => "Test"
              }
            ]
          }
        ]
      }

      assert {:ok, stats} = Banking.ingest_account_data(data)
      assert stats.balances.inserted == 1
      assert stats.balances.skipped == 0
      assert stats.transactions.inserted == 1
      assert stats.transactions.skipped == 0
    end

    test "aggregates stats across multiple accounts" do
      data = %{
        "accountInfo" => [
          %{
            "iban" => @iban,
            "balance" => [
              %{"type" => "booked", "date" => "20251101", "value" => "74670%2F100%3AEUR"}
            ],
            "transaction" => []
          },
          %{
            "iban" => @other_iban,
            "balance" => [
              %{"type" => "booked", "date" => "20251101", "value" => "50000%2F100%3AEUR"}
            ],
            "transaction" => []
          }
        ]
      }

      assert {:ok, stats} = Banking.ingest_account_data(data)
      assert stats.balances.inserted == 2
    end

    test "returns error for missing accountInfo key" do
      assert {:error, :invalid_format} = Banking.ingest_account_data(%{"data" => []})
    end

    test "returns error for non-map input" do
      assert {:error, :invalid_format} = Banking.ingest_account_data("invalid")
    end

    test "returns error when accountInfo is not a list" do
      assert {:error, :invalid_format} =
               Banking.ingest_account_data(%{"accountInfo" => "not a list"})
    end
  end

  describe "list_balances/0" do
    test "returns empty list when no balances exist" do
      assert Banking.list_balances() == []
    end

    test "returns all balances ordered by date descending" do
      insert_balance!(%{date: ~D[2025-10-01]})
      insert_balance!(%{date: ~D[2025-11-01], balance_type: "noted"})

      balances = Banking.list_balances()
      assert length(balances) == 2
      [first, second] = balances
      assert first.date >= second.date
    end
  end

  describe "list_balances_by_iban/1" do
    test "returns only balances for the given IBAN" do
      insert_balance!(%{iban: @iban})
      insert_balance!(%{iban: @other_iban, balance_type: "noted"})

      balances = Banking.list_balances_by_iban(@iban)
      assert length(balances) == 1
      assert hd(balances).iban == @iban
    end

    test "returns empty list for unknown IBAN" do
      insert_balance!()
      assert Banking.list_balances_by_iban("DE00000000000000000000") == []
    end
  end

  describe "get_latest_balance/2" do
    test "returns the most recent booked balance for an IBAN" do
      insert_balance!(%{date: ~D[2025-09-01]})
      insert_balance!(%{date: ~D[2025-11-01], balance_type: "noted"})
      insert_balance!(%{date: ~D[2025-10-01], balance_type: "noted"})

      result = Banking.get_latest_balance(@iban)
      assert result.date == ~D[2025-09-01]
      assert result.balance_type == "booked"
    end

    test "returns the latest balance for a given balance_type" do
      insert_balance!(%{date: ~D[2025-09-01], balance_type: "noted"})
      insert_balance!(%{date: ~D[2025-10-01], balance_type: "noted"})

      result = Banking.get_latest_balance(@iban, "noted")
      assert result.date == ~D[2025-10-01]
    end

    test "returns nil for unknown IBAN" do
      insert_balance!()
      assert Banking.get_latest_balance("DE00000000000000000000") == nil
    end
  end

  describe "list_transactions/0" do
    test "returns empty list when no transactions exist" do
      assert Banking.list_transactions() == []
    end

    test "returns all transactions ordered by date descending" do
      insert_transaction!(%{transaction_date: ~D[2025-10-01], valuta_date: ~D[2025-10-01]})

      insert_transaction!(%{
        transaction_date: ~D[2025-11-01],
        valuta_date: ~D[2025-11-01],
        purpose: "Different payment"
      })

      transactions = Banking.list_transactions()
      assert length(transactions) == 2
      [first, second] = transactions
      assert first.transaction_date >= second.transaction_date
    end
  end

  describe "list_transactions_by_iban/1" do
    test "returns only transactions for the given IBAN" do
      insert_transaction!(%{iban: @iban})
      insert_transaction!(%{iban: @other_iban, purpose: "Other IBAN payment"})

      transactions = Banking.list_transactions_by_iban(@iban)
      assert length(transactions) == 1
      assert hd(transactions).iban == @iban
    end

    test "returns empty list for unknown IBAN" do
      insert_transaction!()
      assert Banking.list_transactions_by_iban("DE00000000000000000000") == []
    end
  end

  describe "get_transaction!/1" do
    test "returns transaction by id" do
      insert_transaction!()
      [transaction] = Banking.list_transactions()

      found = Banking.get_transaction!(transaction.id)
      assert found.id == transaction.id
    end

    test "raises Ecto.NoResultsError for non-existent id" do
      assert_raise Ecto.NoResultsError, fn ->
        Banking.get_transaction!(999_999)
      end
    end
  end
end
