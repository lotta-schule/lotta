defmodule Cockpit.Banking do
  @moduledoc """
  The Banking context.
  """

  import Ecto.Query, warn: false
  alias Lotta.Repo

  alias Cockpit.Banking.AccountBalance
  alias Cockpit.Banking.BankTransaction
  alias Cockpit.Banking.Ingestion

  @doc """
  Ingests account data from AQBanking JSON format.

  Returns statistics about the ingestion process.

  ## Examples

      iex> ingest_account_data(%{"accountInfo" => [...]})
      {:ok, %{balances: %{inserted: 9, skipped: 0}, transactions: %{inserted: 11, skipped: 0}}}

  """
  def ingest_account_data(%{"accountInfo" => account_infos}) when is_list(account_infos) do
    results =
      account_infos
      |> Enum.map(&Ingestion.process_account_info/1)

    # Aggregate results across all accounts
    aggregated =
      Enum.reduce(
        results,
        %{balances: %{inserted: 0, skipped: 0}, transactions: %{inserted: 0, skipped: 0}},
        fn result, acc ->
          %{
            balances: %{
              inserted: acc.balances.inserted + result.balances.inserted,
              skipped: acc.balances.skipped + result.balances.skipped
            },
            transactions: %{
              inserted: acc.transactions.inserted + result.transactions.inserted,
              skipped: acc.transactions.skipped + result.transactions.skipped
            }
          }
        end
      )

    {:ok, aggregated}
  end

  def ingest_account_data(_), do: {:error, :invalid_format}

  @doc """
  Returns the list of account balances.

  ## Examples

      iex> list_balances()
      [%AccountBalance{}, ...]

  """
  def list_balances do
    AccountBalance
    |> order_by([b], desc: b.date)
    |> Repo.all()
  end

  @doc """
  Returns the list of account balances for a specific IBAN.

  ## Examples

      iex> list_balances_by_iban("DE24430609671310166000")
      [%AccountBalance{}, ...]

  """
  def list_balances_by_iban(iban) do
    AccountBalance
    |> where([b], b.iban == ^iban)
    |> order_by([b], desc: b.date)
    |> Repo.all()
  end

  @doc """
  Gets the latest balance for an IBAN.

  ## Examples

      iex> get_latest_balance("DE24430609671310166000")
      %AccountBalance{}

      iex> get_latest_balance("invalid")
      nil

  """
  def get_latest_balance(iban, balance_type \\ "booked") do
    AccountBalance
    |> where([b], b.iban == ^iban and b.balance_type == ^balance_type)
    |> order_by([b], desc: b.date)
    |> limit(1)
    |> Repo.one()
  end

  @doc """
  Returns the latest balance of the given type for each IBAN, one row per account.

  ## Examples

      iex> list_current_balances()
      [%AccountBalance{}, ...]

  """
  def list_current_balances(balance_type \\ "booked") do
    list_balances()
    |> Enum.filter(&(&1.balance_type == balance_type))
    |> Enum.uniq_by(& &1.iban)
  end

  @doc """
  Returns the combined balance and the per-IBAN breakdown across every date
  that has at least one balance record of the given type.

  For each plot date, each IBAN's contribution is its most recently known
  value as of that date (same-date rows averaged), falling back to its
  earliest known value for dates before its first record. The combined
  series sums that contribution across all IBANs; the per-IBAN breakdown
  keeps them separate, both aligned to the same list of dates.

  ## Examples

      iex> balance_history()
      %{
        combined: [%{date: ~D[2025-01-01], value: %Decimal{}}, ...],
        by_iban: %{"DE24..." => [%{date: ~D[2025-01-01], value: %Decimal{}}, ...]}
      }

  """
  def balance_history(balance_type \\ "booked") do
    {plot_dates, series_by_iban} = balance_history_data(balance_type)

    combined =
      Enum.map(plot_dates, fn date ->
        value =
          series_by_iban
          |> Enum.map(fn {_iban, series} -> value_as_of(series, date) end)
          |> Enum.reduce(Decimal.new(0), &Decimal.add/2)

        %{date: date, value: value}
      end)

    by_iban =
      Map.new(series_by_iban, fn {iban, series} ->
        {iban,
         Enum.map(plot_dates, fn date -> %{date: date, value: value_as_of(series, date)} end)}
      end)

    %{combined: combined, by_iban: by_iban}
  end

  @doc """
  Returns the combined balance across all IBANs for every date that has at
  least one balance record of the given type. See `balance_history/1`.

  ## Examples

      iex> combined_balance_history()
      [%{date: ~D[2025-01-01], value: %Decimal{}}, ...]

  """
  def combined_balance_history(balance_type \\ "booked") do
    balance_history(balance_type).combined
  end

  @doc """
  Returns each IBAN's own balance history, aligned to the same dates as
  `combined_balance_history/1`. See `balance_history/1`.

  ## Examples

      iex> balance_history_by_iban()
      %{"DE24..." => [%{date: ~D[2025-01-01], value: %Decimal{}}, ...]}

  """
  def balance_history_by_iban(balance_type \\ "booked") do
    balance_history(balance_type).by_iban
  end

  @doc """
  Returns the configured display name for an IBAN from the `:accounts_list`
  application config, falling back to the IBAN itself when unconfigured or
  nameless.

  ## Examples

      iex> account_name("DE24430609671310166000")
      "Girokonto"

      iex> account_name("unknown")
      "unknown"

  """
  def account_name(iban) do
    Application.get_env(:lotta, :accounts_list, [])
    |> Enum.find_value(iban, fn account ->
      if Keyword.get(account, :iban) == iban, do: Keyword.get(account, :name)
    end)
  end

  defp balance_history_data(balance_type) do
    series_by_iban =
      list_balances()
      |> Enum.filter(&(&1.balance_type == balance_type))
      |> Enum.group_by(& &1.iban)
      |> Map.new(fn {iban, balances} -> {iban, iban_value_series(balances)} end)

    plot_dates =
      series_by_iban
      |> Enum.flat_map(fn {_iban, series} -> Enum.map(series, fn {date, _value} -> date end) end)
      |> Enum.uniq()
      |> Enum.sort(Date)

    {plot_dates, series_by_iban}
  end

  # Given the raw balance rows for a single IBAN, returns `{date, value}`
  # pairs sorted ascending by date, with same-date rows averaged together.
  defp iban_value_series(balances) do
    balances
    |> Enum.group_by(& &1.date, & &1.value)
    |> Enum.map(fn {date, values} -> {date, average(values)} end)
    |> Enum.sort_by(fn {date, _value} -> date end, Date)
  end

  # Returns the value from `series` (a `{date, value}` list sorted ascending)
  # most recently known as of `date`: the latest entry with date <= `date`,
  # or, if `date` predates the series entirely, the earliest entry.
  defp value_as_of(series, date) do
    case Enum.filter(series, fn {d, _value} -> Date.compare(d, date) != :gt end) do
      [] ->
        {_date, value} = List.first(series)
        value

      known ->
        {_date, value} = List.last(known)
        value
    end
  end

  defp average(values) do
    sum = Enum.reduce(values, Decimal.new(0), &Decimal.add/2)
    Decimal.div(sum, Decimal.new(length(values)))
  end

  @doc """
  Returns the list of bank transactions.

  ## Examples

      iex> list_transactions()
      [%BankTransaction{}, ...]

  """
  def list_transactions do
    BankTransaction
    |> order_by([t], desc: t.transaction_date)
    |> Repo.all()
  end

  @doc """
  Returns the list of bank transactions for a specific IBAN.

  ## Examples

      iex> list_transactions_by_iban("DE24430609671310166000")
      [%BankTransaction{}, ...]

  """
  def list_transactions_by_iban(iban) do
    BankTransaction
    |> where([t], t.iban == ^iban)
    |> order_by([t], desc: t.transaction_date)
    |> Repo.all()
  end

  @doc """
  Gets a single transaction.

  Raises `Ecto.NoResultsError` if the BankTransaction does not exist.

  ## Examples

      iex> get_transaction!(123)
      %BankTransaction{}

      iex> get_transaction!(456)
      ** (Ecto.NoResultsError)

  """
  def get_transaction!(id), do: Repo.get!(BankTransaction, id)
end
