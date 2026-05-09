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
