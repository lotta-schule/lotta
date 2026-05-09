defmodule Cockpit.Banking.BankTransaction do
  @moduledoc """
  Schema for a bank transaction imported from an AQBanking-compatible source.

  Deduplication is handled via `unique_hash`, a SHA-256 digest of the local account number,
  transaction date, valuta date, amount, remote identifier, purpose, and primanota.
  """

  use Ecto.Schema

  import Ecto.Changeset

  schema "bank_transactions" do
    field(:iban, :string)
    field(:transaction_date, :date)
    field(:valuta_date, :date)
    field(:amount, :decimal)
    field(:currency, :string, default: "EUR")

    # Local account
    field(:local_bank_code, :string)
    field(:local_account_number, :string)

    # Remote account
    field(:remote_bank_code, :string)
    field(:remote_account_number, :string)
    field(:remote_iban, :string)
    field(:remote_bic, :string)
    field(:remote_name, :string)

    # Transaction details
    field(:transaction_code, :integer)
    field(:transaction_text, :string)
    field(:transaction_key, :string)
    field(:primanota, :string)
    field(:purpose, :string)

    # SEPA fields
    field(:end_to_end_reference, :string)
    field(:creditor_scheme_id, :string)
    field(:mandate_id, :string)
    field(:customer_reference, :string)
    field(:ultimate_debtor, :string)

    # Deduplication
    field(:unique_hash, :string)

    # Metadata
    field(:transaction_type, :string)
    field(:sub_type, :string)
    field(:status, :string)

    timestamps()
  end

  @doc false
  def changeset(transaction, attrs) do
    transaction
    |> cast(attrs, [
      :iban,
      :transaction_date,
      :valuta_date,
      :amount,
      :currency,
      :local_bank_code,
      :local_account_number,
      :remote_bank_code,
      :remote_account_number,
      :remote_iban,
      :remote_bic,
      :remote_name,
      :transaction_code,
      :transaction_text,
      :transaction_key,
      :primanota,
      :purpose,
      :end_to_end_reference,
      :creditor_scheme_id,
      :mandate_id,
      :customer_reference,
      :ultimate_debtor,
      :transaction_type,
      :sub_type,
      :status
    ])
    |> validate_required([
      :iban,
      :transaction_date,
      :valuta_date,
      :amount,
      :currency
    ])
    |> compute_unique_hash()
    |> unique_constraint(:unique_hash)
  end

  defp compute_unique_hash(%Ecto.Changeset{valid?: false} = changeset), do: changeset

  defp compute_unique_hash(changeset) do
    local_account = get_field(changeset, :local_account_number)
    transaction_date = get_field(changeset, :transaction_date)
    valuta_date = get_field(changeset, :valuta_date)
    amount = get_field(changeset, :amount)

    if local_account && transaction_date && valuta_date && amount do
      hash =
        build_transaction_hash(changeset, local_account, transaction_date, valuta_date, amount)

      put_change(changeset, :unique_hash, hash)
    else
      changeset
    end
  end

  defp build_transaction_hash(changeset, local_account, transaction_date, valuta_date, amount) do
    remote_identifier =
      get_field(changeset, :remote_iban) ||
        get_field(changeset, :remote_account_number) ||
        ""

    purpose = get_field(changeset, :purpose) || ""
    primanota = get_field(changeset, :primanota) || ""

    hash_input =
      "#{local_account}|#{Date.to_string(transaction_date)}|#{Date.to_string(valuta_date)}|#{Decimal.to_string(amount)}|#{remote_identifier}|#{purpose}|#{primanota}"

    :crypto.hash(:sha256, hash_input) |> Base.encode16(case: :lower)
  end
end
