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
    test "Should return a cache-control header", %{f: file} do
      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/storage/f/#{file.id}")

      assert ["max-age=604800"] = Plug.Conn.get_resp_header(conn, "cache-control")
    end

    test "Should redirect to the file when requested", %{f: file} do
      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/storage/f/#{file.id}")

      assert response(conn, 302)
    end
  end
end
