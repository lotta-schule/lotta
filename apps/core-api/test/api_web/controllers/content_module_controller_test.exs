defmodule ApiWeb.ContentModuleControllerTest do
  use ApiWeb.ConnCase

  alias Api.Content
  alias Api.Content.ContentModule

  @create_attrs %{
    text: "some text",
    type: "some type"
  }
  @update_attrs %{
    text: "some updated text",
    type: "some updated type"
  }
  @invalid_attrs %{text: nil, type: nil}

  def fixture(:content_module) do
    {:ok, content_module} = Content.create_content_module(@create_attrs)
    content_module
  end

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all content_modules", %{conn: conn} do
      conn = get(conn, Routes.content_module_path(conn, :index))
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create content_module" do
    test "renders content_module when data is valid", %{conn: conn} do
      conn = post(conn, Routes.content_module_path(conn, :create), content_module: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, Routes.content_module_path(conn, :show, id))

      assert %{
               "id" => id,
               "text" => "some text",
               "type" => "some type"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.content_module_path(conn, :create), content_module: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update content_module" do
    setup [:create_content_module]

    test "renders content_module when data is valid", %{conn: conn, content_module: %ContentModule{id: id} = content_module} do
      conn = put(conn, Routes.content_module_path(conn, :update, content_module), content_module: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, Routes.content_module_path(conn, :show, id))

      assert %{
               "id" => id,
               "text" => "some updated text",
               "type" => "some updated type"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, content_module: content_module} do
      conn = put(conn, Routes.content_module_path(conn, :update, content_module), content_module: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete content_module" do
    setup [:create_content_module]

    test "deletes chosen content_module", %{conn: conn, content_module: content_module} do
      conn = delete(conn, Routes.content_module_path(conn, :delete, content_module))
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, Routes.content_module_path(conn, :show, content_module))
      end
    end
  end

  defp create_content_module(_) do
    content_module = fixture(:content_module)
    {:ok, content_module: content_module}
  end
end
