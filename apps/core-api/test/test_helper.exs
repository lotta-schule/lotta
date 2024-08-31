Application.ensure_all_started(:ex_machina)

ExUnit.configure(formatters: [JUnitFormatter, ExUnit.CLIFormatter])

Ecto.Adapters.SQL.Sandbox.mode(Lotta.Repo, :manual)

ExUnit.start()
