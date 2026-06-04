unless Code.ensure_loaded?(Lotta.Repo.Seeder) do
  Code.require_file("priv/repo/seeder/Seeder.ex")
end

Lotta.Repo.Seeder.seed()
