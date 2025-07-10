defmodule Lotta.Repo.TenantMigrations.MakeUsergroupEnrolmenttokensArrayNonNull do
  @moduledoc false

  use Ecto.Migration

  def change do
    alter table(:user_groups) do
      modify(:enrollment_tokens, {:array, :string}, default: [], null: false)
    end
  end
end
