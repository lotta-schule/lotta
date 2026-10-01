defmodule Lotta.WorkerCase do
  @moduledoc """
  Base test case for Oban workers.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      use Oban.Testing, repo: Lotta.Repo, prefix: "oban"

      import Oban.Testing, only: [with_testing_mode: 2]
      import Ecto
      import Ecto.Changeset
      import Ecto.Query
      import Lotta.DataCase

      defp create_file_stream(file_path),
        do:
          file_path
          |> Elixir.File.open!()
          |> IO.binstream(5 * 1024 * 1024)
    end
  end

  setup tags do
    case Ecto.Adapters.SQL.Sandbox.checkout(Lotta.Repo) do
      :ok ->
        if tags[:async] != true do
          Ecto.Adapters.SQL.Sandbox.mode(Lotta.Repo, {:shared, self()})
        end

        :ok

      {:already, _} ->
        :ok

      error ->
        error
    end

    if tags[:creates_tenant] do
      on_exit(fn ->
        Lotta.Repo.with_new_dynamic_repo(fn _ ->
          {:ok, %{rows: rows}} =
            Lotta.Repo.query("""
            SELECT schema_name FROM information_schema.schemata
            WHERE schema_name LIKE 'tenant_%' AND schema_name != 'tenant_test'
            """)

          Enum.each(rows, fn [schema] ->
            Lotta.Repo.query!("DROP SCHEMA \"#{schema}\" CASCADE")
          end)
        end)
      end)
    end

    :ok
  end
end
