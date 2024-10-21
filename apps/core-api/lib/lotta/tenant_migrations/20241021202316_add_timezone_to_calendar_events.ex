defmodule Lotta.Repo.TenantMigrations.AddTimezoneToEvents do
  @moduledoc false

  use Ecto.Migration

  import Ecto.Query

  alias Lotta.Repo

  def change do
    alter table(:calendar_events) do
      add :timezone, :string
    end

    flush()

    if direction() == :up do
      from(c in "calendar_events",
        where: is_nil(c.timezone)
      )
      |> Repo.update_all([set: [timezone: "Europe/Berlin"]], prefix: prefix())
    end
  end
end
