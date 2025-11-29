defmodule Lotta.Repo.Migrations.MakeTenantAddressNullable do
  use Ecto.Migration

  def change do
    alter table(:tenants) do
      modify(:address, :string, null: true, default: nil)
    end
  end
end
