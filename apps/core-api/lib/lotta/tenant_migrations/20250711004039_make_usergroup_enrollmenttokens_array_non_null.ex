defmodule Lotta.Repo.TenantMigrations.MakeUsergroupEnrollmenttokensArrayNonNull do
  @moduledoc false

  import Ecto.Query

  use Ecto.Migration

  def change do
    from(u in "user_groups", where: is_nil(u.enrollment_tokens))
    |> Lotta.Repo.update_all([set: [enrollment_tokens: []]], prefix: prefix())

    flush()

    alter table(:user_groups) do
      modify(:enrollment_tokens, {:array, :string}, default: [], null: false)
    end
  end
end
