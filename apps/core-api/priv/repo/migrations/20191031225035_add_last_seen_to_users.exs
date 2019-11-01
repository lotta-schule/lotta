defmodule Api.Repo.Migrations.AddLastSeenToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :last_seen, :naive_datetime
    end
  end
end
