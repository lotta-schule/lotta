defmodule Cockpit.Banking.AccountBalance do
  @moduledoc """
  Schema for an account balance snapshot associated with an IBAN.

  `balance_type` is either `"booked"` or `"noted"`. Deduplication is enforced via
  `unique_hash`, a SHA-256 digest of the IBAN, date, and balance type.
  """

  use Ecto.Schema

  import Ecto.Changeset

  schema "account_balances" do
    field(:iban, :string)
    field(:date, :date)
    field(:value, :decimal)
    field(:currency, :string, default: "EUR")
    field(:balance_type, :string)
    field(:unique_hash, :string)

    timestamps()
  end

  @doc false
  def changeset(account_balance, attrs) do
    account_balance
    |> cast(attrs, [
      :iban,
      :date,
      :value,
      :currency,
      :balance_type
    ])
    |> validate_required([
      :iban,
      :date,
      :value,
      :currency,
      :balance_type
    ])
    |> validate_inclusion(:balance_type, ["booked", "noted"])
    |> compute_unique_hash()
    |> unique_constraint(:unique_hash)
  end

  defp compute_unique_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true} = changeset ->
        iban = get_field(changeset, :iban)
        date = get_field(changeset, :date)
        balance_type = get_field(changeset, :balance_type)

        if iban && date && balance_type do
          hash_input = "#{iban}|#{Date.to_string(date)}|#{balance_type}"
          hash = :crypto.hash(:sha256, hash_input) |> Base.encode16(case: :lower)
          put_change(changeset, :unique_hash, hash)
        else
          changeset
        end

      _ ->
        changeset
    end
  end
end
