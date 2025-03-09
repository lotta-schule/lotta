defmodule Lotta.WorkerCase do
  @moduledoc """
  Base test case for Oban workers.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      use Oban.Testing, repo: Lotta.Repo, prefix: "oban"

      import Ecto
      import Ecto.Changeset
      import Ecto.Query
      import Lotta.DataCase
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Lotta.Repo)

    if tags[:async] != true do
      Ecto.Adapters.SQL.Sandbox.mode(Lotta.Repo, {:shared, self()})
    end

    :ok
  end
end
