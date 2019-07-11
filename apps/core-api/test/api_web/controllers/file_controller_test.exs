defmodule ApiWeb.FileControllerTest do
  use ApiWeb.ConnCase

  alias Api.Account
  alias Api.Accounts.File

  @create_attrs %{
    file_type: "some file_type",
    filename: "some filename",
    filesize: 42,
    mime_type: "some mime_type",
    path: "some path",
    remote_location: "some remote_location"
  }
  @update_attrs %{
    file_type: "some updated file_type",
    filename: "some updated filename",
    filesize: 43,
    mime_type: "some updated mime_type",
    path: "some updated path",
    remote_location: "some updated remote_location"
  }
  @invalid_attrs %{file_type: nil, filename: nil, filesize: nil, mime_type: nil, path: nil, remote_location: nil}

  def fixture(:file) do
    {:ok, file} = Accounts.create_file(@create_attrs)
    file
  end

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all files", %{conn: conn} do
      conn = get(conn, Routes.file_path(conn, :index))
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create file" do
    test "renders file when data is valid", %{conn: conn} do
      conn = post(conn, Routes.file_path(conn, :create), file: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, Routes.file_path(conn, :show, id))

      assert %{
               "id" => id,
               "file_type" => "some file_type",
               "filename" => "some filename",
               "filesize" => 42,
               "mime_type" => "some mime_type",
               "path" => "some path",
               "remote_location" => "some remote_location"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.file_path(conn, :create), file: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update file" do
    setup [:create_file]

    test "renders file when data is valid", %{conn: conn, file: %File{id: id} = file} do
      conn = put(conn, Routes.file_path(conn, :update, file), file: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, Routes.file_path(conn, :show, id))

      assert %{
               "id" => id,
               "file_type" => "some updated file_type",
               "filename" => "some updated filename",
               "filesize" => 43,
               "mime_type" => "some updated mime_type",
               "path" => "some updated path",
               "remote_location" => "some updated remote_location"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, file: file} do
      conn = put(conn, Routes.file_path(conn, :update, file), file: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete file" do
    setup [:create_file]

    test "deletes chosen file", %{conn: conn, file: file} do
      conn = delete(conn, Routes.file_path(conn, :delete, file))
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, Routes.file_path(conn, :show, file))
      end
    end
  end

  defp create_file(_) do
    file = fixture(:file)
    {:ok, file: file}
  end
end
