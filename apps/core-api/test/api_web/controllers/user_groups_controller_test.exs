defmodule ApiWeb.UserGroupControllerTest do
  use ApiWeb.ConnCase

  alias Api.Accounts
  alias Api.Accounts.UserGroup

  @create_attrs %{
    name: "some name",
    priority: 42
  }
  @update_attrs %{
    name: "some updated name",
    priority: 43
  }
  @invalid_attrs %{name: nil, priority: nil}

  def fixture(:user_group) do
    {:ok, user_group} = Accounts.create_user_group(@create_attrs)
    user_group
  end

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all user_groups", %{conn: conn} do
      conn = get(conn, Routes.user_groups_path(conn, :index))
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create user_group" do
    test "renders user_group when data is valid", %{conn: conn} do
      conn = post(conn, Routes.user_group_path(conn, :create), user_group: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, Routes.user_group_path(conn, :show, id))

      assert %{
               "id" => id,
               "name" => "some name",
               "priority" => 42
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.user_group_path(conn, :create), user_group: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update user_group" do
    setup [:create_user_group]

    test "renders user_group when data is valid", %{conn: conn, user_group: %UserGroup{id: id} = user_group} do
      conn = put(conn, Routes.user_group_path(conn, :update, user_group), user_group: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, Routes.user_group_path(conn, :show, id))

      assert %{
               "id" => id,
               "name" => "some updated name",
               "priority" => 43
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, user_group: user_group} do
      conn = put(conn, Routes.user_group_path(conn, :update, user_group), user_group: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete user_group" do
    setup [:create_user_group]

    test "deletes chosen user_group", %{conn: conn, user_group: user_group} do
      conn = delete(conn, Routes.user_group_path(conn, :delete, user_group))
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, Routes.user_group_path(conn, :show, user_group))
      end
    end
  end

  defp create_user_group(_) do
    user_group = fixture(:user_group)
    {:ok, user_group: user_group}
  end
end
