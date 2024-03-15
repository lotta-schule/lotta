defmodule Lotta.Repo.TenantMigrations.RenameGroupPriorityToSortKey do
  @moduledoc false

  use Ecto.Migration

  def change do
    rename(table("user_groups"), :priority, to: :sort_key)
  end
end
