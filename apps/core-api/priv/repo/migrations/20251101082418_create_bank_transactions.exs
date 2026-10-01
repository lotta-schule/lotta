defmodule Cockpit.Repo.Migrations.CreateBankTransactions do
  use Ecto.Migration

  def change do
    create_if_not_exists table(:bank_transactions) do
      add(:iban, :string, null: false)
      add(:transaction_date, :date, null: false)
      add(:valuta_date, :date, null: false)
      add(:amount, :decimal, precision: 15, scale: 2, null: false)
      add(:currency, :string, default: "EUR", null: false)

      # Local account
      add(:local_bank_code, :string)
      add(:local_account_number, :string)

      # Remote account
      add(:remote_bank_code, :string)
      add(:remote_account_number, :string)
      add(:remote_iban, :string)
      add(:remote_bic, :string)
      add(:remote_name, :string)

      # Transaction details
      add(:transaction_code, :integer)
      add(:transaction_text, :string)
      add(:transaction_key, :string)
      add(:primanota, :string)
      add(:purpose, :text)

      # SEPA fields
      add(:end_to_end_reference, :string)
      add(:creditor_scheme_id, :string)
      add(:mandate_id, :string)
      add(:customer_reference, :string)
      add(:ultimate_debtor, :string)

      # Deduplication
      add(:unique_hash, :string, null: false)

      # Metadata
      add(:transaction_type, :string)
      add(:sub_type, :string)
      add(:status, :string)

      timestamps()
    end

    create_if_not_exists(unique_index(:bank_transactions, [:unique_hash]))
    create_if_not_exists(index(:bank_transactions, [:iban]))
    create_if_not_exists(index(:bank_transactions, [:transaction_date]))
    create_if_not_exists(index(:bank_transactions, [:remote_iban]))
  end
end
