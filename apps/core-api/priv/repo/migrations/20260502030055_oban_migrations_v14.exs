defmodule MyApp.Repo.Migrations.UpdateObanToV14 do
  use Ecto.Migration

  def up, do: Oban.Migrations.up(version: 14, prefix: "oban")
  def down, do: Oban.Migrations.down(version: 12, prefix: "oban")
end
