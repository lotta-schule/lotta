defmodule Cockpit.Banking.Ingestion do
  @moduledoc """
  Handles parsing and ingestion of AQBanking JSON data.
  """

  alias Cockpit.Banking.AccountBalance
  alias Cockpit.Banking.BankTransaction
  alias Lotta.Repo

  @doc """
  Parses AQBanking date format "YYYYMMDD" to Date.

  ## Examples

      iex> parse_date("20251101")
      ~D[2025-11-01]
  """
  def parse_date(nil), do: nil
  def parse_date(""), do: nil

  def parse_date(date_string) when is_binary(date_string) do
    case date_string do
      <<year::binary-size(4), month::binary-size(2), day::binary-size(2)>> ->
        {:ok, date} =
          Date.new(String.to_integer(year), String.to_integer(month), String.to_integer(day))

        date

      _ ->
        nil
    end
  end

  @doc """
  Parses AQBanking value format "7467%2F10%3AEUR" to {Decimal, currency}.

  The format is URL-encoded, decodes to "7467/10:EUR" which means 7467/10 = 746.7 EUR

  ## Examples

      iex> parse_value("7467%2F10%3AEUR")
      {Decimal.new("746.7"), "EUR"}
  """
  def parse_value(nil), do: {Decimal.new(0), "EUR"}
  def parse_value(""), do: {Decimal.new(0), "EUR"}

  def parse_value(encoded_value) when is_binary(encoded_value) do
    decoded = URI.decode(encoded_value)

    case String.split(decoded, ":", parts: 2) do
      [amount_str, currency] ->
        amount = parse_amount(amount_str)
        {amount, currency}

      [amount_str] ->
        amount = parse_amount(amount_str)
        {amount, "EUR"}

      _ ->
        {Decimal.new(0), "EUR"}
    end
  end

  defp parse_amount(amount_str) do
    case String.split(amount_str, "/") do
      [numerator, denominator] ->
        Decimal.div(numerator, denominator)

      [value] ->
        Decimal.new(value)

      _ ->
        Decimal.new(0)
    end
  end

  @doc """
  Decodes URL-encoded strings.

  ## Examples

      iex> decode_string("F%C3%B6rderverein")
      "Förderverein"
  """
  def decode_string(nil), do: nil
  def decode_string(""), do: ""
  def decode_string(value) when is_binary(value), do: URI.decode(value)

  @doc """
  Parses a balance entry from the JSON data.
  """
  def parse_balance(balance_data, iban) do
    {value, currency} = parse_value(balance_data["value"])

    %{
      iban: iban,
      date: parse_date(balance_data["date"]),
      value: value,
      currency: currency,
      balance_type: balance_data["type"]
    }
  end

  @doc """
  Parses a transaction entry from the JSON data.
  """
  def parse_transaction(transaction_data, iban) do
    {amount, currency} = parse_value(transaction_data["value"])

    %{
      iban: iban,
      transaction_date: parse_date(transaction_data["date"]),
      valuta_date: parse_date(transaction_data["valutaDate"]),
      amount: amount,
      currency: currency,
      local_bank_code: transaction_data["localBankCode"],
      local_account_number: transaction_data["localAccountNumber"],
      remote_bank_code: transaction_data["remoteBankCode"],
      remote_account_number: transaction_data["remoteAccountNumber"],
      remote_iban: transaction_data["remoteIban"],
      remote_bic: transaction_data["remoteBic"],
      remote_name: decode_string(transaction_data["remoteName"]),
      transaction_code: transaction_data["transactionCode"],
      transaction_text: decode_string(transaction_data["transactionText"]),
      transaction_key: transaction_data["transactionKey"],
      primanota: transaction_data["primanota"],
      purpose: decode_string(transaction_data["purpose"]),
      end_to_end_reference: transaction_data["endToEndReference"],
      creditor_scheme_id: transaction_data["creditorSchemeId"],
      mandate_id: transaction_data["mandateId"],
      customer_reference: transaction_data["customerReference"],
      ultimate_debtor: transaction_data["ultimateDebtor"],
      transaction_type: transaction_data["type"],
      sub_type: transaction_data["subType"],
      status: transaction_data["status"]
    }
  end

  @doc """
  Inserts a balance with deduplication.
  Returns {:ok, :inserted} or {:ok, :skipped}
  """
  def insert_balance(balance_attrs) do
    changeset = AccountBalance.changeset(%AccountBalance{}, balance_attrs)

    case Repo.insert(changeset, on_conflict: :nothing, conflict_target: :unique_hash) do
      {:ok, %{id: id}} when not is_nil(id) ->
        {:ok, :inserted}

      {:ok, _} ->
        {:ok, :skipped}

      {:error, changeset} ->
        {:error, changeset}
    end
  end

  @doc """
  Inserts a transaction with deduplication.
  Returns {:ok, :inserted} or {:ok, :skipped}
  """
  def insert_transaction(transaction_attrs) do
    changeset = BankTransaction.changeset(%BankTransaction{}, transaction_attrs)

    case Repo.insert(changeset, on_conflict: :nothing, conflict_target: :unique_hash) do
      {:ok, %{id: id}} when not is_nil(id) ->
        {:ok, :inserted}

      {:ok, _} ->
        {:ok, :skipped}

      {:error, changeset} ->
        {:error, changeset}
    end
  end

  @doc """
  Processes account info and ingests all balances and transactions.
  """
  def process_account_info(account_info) do
    iban = account_info["iban"]

    # Process balances
    balance_results =
      (account_info["balance"] || [])
      |> Enum.map(fn balance_data ->
        balance_attrs = parse_balance(balance_data, iban)
        insert_balance(balance_attrs)
      end)

    # Process transactions
    transaction_results =
      (account_info["transaction"] || [])
      |> Enum.map(fn transaction_data ->
        transaction_attrs = parse_transaction(transaction_data, iban)
        insert_transaction(transaction_attrs)
      end)

    # Count results
    balance_inserted = Enum.count(balance_results, fn {:ok, status} -> status == :inserted end)
    balance_skipped = Enum.count(balance_results, fn {:ok, status} -> status == :skipped end)

    transaction_inserted =
      Enum.count(transaction_results, fn {:ok, status} -> status == :inserted end)

    transaction_skipped =
      Enum.count(transaction_results, fn {:ok, status} -> status == :skipped end)

    %{
      balances: %{inserted: balance_inserted, skipped: balance_skipped},
      transactions: %{inserted: transaction_inserted, skipped: transaction_skipped}
    }
  end
end
