defmodule LottaWeb.ConnCase do
  @moduledoc """
  This module defines the test case to be used by
  tests that require setting up a connection.

  Such tests rely on `Phoenix.ConnTest` and also
  import other functionality to make it easier
  to build common data structures and query the data layer.

  Finally, if the test case interacts with the database,
  it cannot be async. For this reason, every test runs
  inside a transaction which is reset at the beginning
  of the test unless the test case is marked as async.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      # Import conveniences for testing with connections
      import Plug.Conn
      import Phoenix.ConnTest
      import LottaWeb.ConnCase

      # The default endpoint for testing
      @endpoint LottaWeb.Endpoint

      use LottaWeb, :verified_routes
    end
  end

  # TODO: This should probably better not be ignored
  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Lotta.Repo)

    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end

  def authorize(conn, user) do
    {:ok, jwt, _} = LottaWeb.Auth.AccessToken.encode_and_sign(user)

    conn
    |> Plug.Conn.put_req_header("authorization", "Bearer #{jwt}")
  end

  @doc """
  Creates a Phoenix ConnTest object with the tenant header set.
  """
  def build_tenant_conn([slug: slug] \\ [slug: "test"]) do
    Phoenix.ConnTest.build_conn()
    |> Plug.Conn.put_req_header("tenant", "slug:#{slug}")
  end
end
