defmodule CockpitWeb.UserSessionControllerTest do
  use CockpitWeb.ConnCase

  describe "GET /users/login" do
    test "renders login page", %{conn: conn} do
      conn = get(conn, ~p"/users/login")
      assert html_response(conn, 200) =~ "login"
    end
  end

  describe "POST /users/login" do
    test "logs in with valid credentials", %{conn: conn} do
      username = Application.get_env(:lotta, :cockpit)[:username]
      password = Application.get_env(:lotta, :cockpit)[:password]

      conn =
        post(conn, ~p"/users/login", %{
          "user" => %{"username" => username, "password" => password}
        })

      assert redirected_to(conn) == ~p"/"

      flash_msg =
        conn
        |> fetch_flash()
        |> Map.get(:assigns)
        |> Map.get(:flash)
        |> Phoenix.Flash.get(:info)

      assert flash_msg == "Willkommen zurück, Capt'n!"
    end

    test "rejects invalid credentials", %{conn: conn} do
      conn =
        post(conn, ~p"/users/login", %{"user" => %{"username" => "wrong", "password" => "wrong"}})

      assert redirected_to(conn) == ~p"/users/login"

      flash_msg =
        conn
        |> fetch_flash()
        |> Map.get(:assigns)
        |> Map.get(:flash)
        |> Phoenix.Flash.get(:info)

      assert flash_msg == "Falsche Zugangsdaten"
    end

    test "handles missing params", %{conn: conn} do
      conn = post(conn, ~p"/users/login", %{})

      assert html_response(conn, 200) =~ "Falsche Zugangsdaten"
    end
  end

  describe "DELETE /logout" do
    test "logs out user", %{conn: conn} do
      conn =
        conn
        |> authenticate()
        |> get(~p"/users/logout")

      assert redirected_to(conn) == ~p"/users/login"

      flash_msg =
        conn
        |> fetch_flash()
        |> Map.get(:assigns)
        |> Map.get(:flash)
        |> Phoenix.Flash.get(:info)

      assert flash_msg == "Erfolgreich abgemeldet"
    end
  end
end
