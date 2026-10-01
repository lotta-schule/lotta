defmodule Cockpit.Repo.Migrations.CreateAccountBalances do
  use Ecto.Migration

  def change do
    create_if_not_exists table(:account_balances) do
      add(:iban, :string, null: false)
      add(:date, :date, null: false)
      add(:value, :decimal, precision: 15, scale: 2, null: false)
      add(:currency, :string, default: "EUR", null: false)
      add(:balance_type, :string, null: false)
      add(:unique_hash, :string, null: false)

      timestamps()
    end

    create_if_not_exists(unique_index(:account_balances, [:unique_hash]))
    create_if_not_exists(index(:account_balances, [:iban]))
    create_if_not_exists(index(:account_balances, [:date]))
  end
end
