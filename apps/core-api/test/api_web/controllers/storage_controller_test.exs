defmodule LottaWeb.StorageControllerTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: true

  import Phoenix.ConnTest
  import Ecto.Query

  alias Lotta.Storage.File
  alias Lotta.{Tenants, Repo}

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    file =
      Repo.one!(
        from(f in File, where: f.filename == ^"ich_schoen.jpg"),
        prefix: tenant.prefix
      )

    {:ok, %{f: file}}
  end

  describe "File / FileConversion proxy" do
    test "Should return the file when requested via proxy", %{f: file} do
      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/storage/f/#{file.id}")

      assert response(conn, 200)
    end
  end
end
