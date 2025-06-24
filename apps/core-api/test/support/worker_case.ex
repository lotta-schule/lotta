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
        # If the sandbox is already checked out, we can continue without changing the mode
        :ok

      error ->
        error
    end

    :ok
  end
end
