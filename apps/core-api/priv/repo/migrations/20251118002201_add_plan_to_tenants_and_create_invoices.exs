defmodule Lotta.Repo.Migrations.AddPlanToTenants do
  use Ecto.Migration

  def change do
    alter table(:tenants) do
      add(:current_plan_name, :string, null: true)
      add(:current_plan_expires_at, :date, null: true)
      add(:next_plan_name, :string, null: true)
      add(:customer_no, :string, null: true)
      add(:billing_address, :text, null: true)
    end

    create(index(:tenants, [:current_plan_name]))

    create table(:additional_items) do
      add(:name, :string, null: false)
      add(:description, :text, null: false, default: "")
      add(:valid_from, :date, null: true)
      add(:valid_until, :date, null: true)
      add(:price, :decimal, null: false, precision: 10, scale: 2)
      add(:tenant_id, references(:tenants, on_delete: :delete_all), null: false)

      timestamps()
    end

    create(index(:additional_items, [:tenant_id]))
    create(index(:additional_items, [:tenant_id, :valid_from, :valid_until]))

    create table(:invoices) do
      add(:invoice_number, :string, null: false)
      add(:tenant_id, references(:tenants, on_delete: :nothing), null: false)

      add(:year, :integer, null: false)
      add(:month, :integer, null: false)
      add(:period_start, :date, null: false)
      add(:period_end, :date, null: false)

      add(:issued_at, :utc_datetime)
      add(:due_date, :date)
      add(:paid_at, :utc_datetime)

      add(:status, :string, null: false, default: "draft")

      add(:total, :decimal, precision: 10, scale: 2, null: false)

      add(:notes, :text)

      timestamps()
    end

    create(unique_index(:invoices, [:invoice_number]))
    create(index(:invoices, [:tenant_id]))
    create(unique_index(:invoices, [:tenant_id, :year, :month]))
    create(index(:invoices, [:status]))
    create(index(:invoices, [:due_date]))

    create table(:invoice_items) do
      add(:invoice_id, references(:invoices, on_delete: :delete_all), null: false)
      add(:type, :string, null: false)
      add(:period_start, :date, null: false)
      add(:period_end, :date, null: false)
      add(:rows, :jsonb, null: false, default: "[]")
      add(:amount, :decimal, precision: 10, scale: 2, null: false)
      add(:notes, :text)

      timestamps()
    end

    create(index(:invoice_items, [:invoice_id]))
  end
end
