defmodule Lotta.Repo.Migrations.AddObanJobsTable do
  use Ecto.Migration

  def up, do: Oban.Migrations.up(version: 12, prefix: "oban")
  def down, do: Oban.Migrations.down(version: 1, prefix: "oban")
end
