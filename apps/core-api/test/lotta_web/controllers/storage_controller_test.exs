defmodule LottaWeb.StorageControllerTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: true
  use Lotta.WorkerCase

  import Phoenix.ConnTest

  alias Lotta.Fixtures

  setup do
    Tesla.Mock.mock(fn
      %{method: :get} ->
        %Tesla.Env{
          status: 200,
          body:
            "test/support/fixtures/image_file.png"
            |> File.open!()
            |> IO.binstream(5 * 1024 * 1024)
        }
    end)
  end

  describe "File / FileConversion proxy" do
    test "Should return a cache-control header" do
      user = Fixtures.fixture(:admin_user)
      file = Fixtures.fixture(:real_image_file, user)

      conn =
        build_tenant_conn()
        |> get("/storage/f/#{file.id}")

      assert ["max-age=604800"] = Plug.Conn.get_resp_header(conn, "cache-control")
    end

    test "Should redirect to the file when requested" do
      user = Fixtures.fixture(:admin_user)
      file = Fixtures.fixture(:real_image_file, user)

      conn =
        build_tenant_conn()
        |> get("/storage/f/#{file.id}")

      assert response(conn, 302)
    end

    test "Should respond with the correct format if requested" do
      user = Fixtures.fixture(:admin_user)
      file = Fixtures.fixture(:real_image_file, user)

      conn =
        build_tenant_conn()
        |> get("/data/storage/f/#{file.id}/preview_200")

      assert response(conn, 200)
    end

    test "Should respond with the original format if requested" do
      user = Fixtures.fixture(:admin_user)
      file = Fixtures.fixture(:real_image_file, user)

      conn =
        build_tenant_conn()
        |> get("/data/storage/f/#{file.id}/original")

      assert response(conn, 200)
    end

    test "Should respond with a 404 if the file does not exist" do
      conn =
        build_tenant_conn()
        |> get("/data/storage/f/i-do-not-exist/original")

      assert response(conn, 404)

      conn =
        build_tenant_conn()
        |> get("/data/storage/f/0000a00a-00a0-00a0-00a0-00a000a000a0/original")

      assert response(conn, 404)
    end

    # test "Should respond with a 404 if the format does not exist" do
    #   user = Fixtures.fixture(:admin_user)
    #   file = Fixtures.fixture(:real_image_file, user)

    #   conn =
    #     build_tenant_conn()
    #     |> get("/data/storage/f/#{file.id}/this-format-does-not-exist")

    #   assert response(conn, 404)

    #   conn =
    #     build_tenant_conn()
    #     |> get("/data/storage/f/#{file.id}/audioplay_aac")

    #   assert response(conn, 404)
    # end

    # test "Should respond with a 428 if a format neither ready nor available is requested" do
    #   user = Fixtures.fixture(:admin_user)
    #   file = Fixtures.fixture(:real_audio_file, user)

    #   conn =
    #     build_tenant_conn()
    #     |> get("/data/storage/f/#{file.id}/audioplay_aac")

    #   assert response(conn, 428)
    # end
  end
end
