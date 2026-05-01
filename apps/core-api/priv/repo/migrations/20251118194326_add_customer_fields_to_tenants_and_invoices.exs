defmodule Lotta.Repo.Migrations.AddCustomerFieldsToTenantsAndInvoices do
  use Ecto.Migration

  def change do
    alter table(:tenants) do
      add(:contact_name, :string)
      add(:contact_email, :string)
      add(:contact_phone, :string)
    end

    alter table(:invoices) do
      add(:customer_name, :string)
      add(:customer_address, :string)
      add(:customer_no, :string)
      add(:customer_contact_name, :string)
      add(:customer_contact_email, :string)
      add(:customer_contact_phone, :string)
    end
  end
end
