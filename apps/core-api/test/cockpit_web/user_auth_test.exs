defmodule CockpitWeb.UserAuthTest do
  @moduledoc false

  use CockpitWeb.ConnCase, async: true

  alias CockpitWeb.UserAuth
  alias CockpitWeb.Auth.Token

  @cookie_name "cockpit_jwt"

  describe "log_in/1" do
    test "generates token and stores in session", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{})
        |> UserAuth.log_in()

      token = get_session(conn, @cookie_name)
      assert token != nil
      assert is_binary(token)

      assert {:ok, _claims} = Token.verify_and_validate(token)
    end

    test "redirects to signed in path", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{})
        |> UserAuth.log_in()

      assert redirected_to(conn) == "/"
    end
  end

  describe "log_out/1" do
    test "drops the session", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{@cookie_name => "some_token"})
        |> UserAuth.log_out()

      assert conn.private[:plug_session_info] == :drop
    end

    test "redirects to login page", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{})
        |> UserAuth.log_out()

      assert redirected_to(conn) == "/users/login"
    end

    test "halts the connection", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{})
        |> UserAuth.log_out()

      assert conn.halted
    end
  end

  describe "fetch_current_user/2" do
    test "assigns current_user when valid token in session", %{conn: conn} do
      {:ok, token, claims} = Token.generate_and_sign()

      conn =
        conn
        |> init_test_session(%{@cookie_name => token})
        |> UserAuth.fetch_current_user([])

      assert conn.assigns[:current_user] == claims
      refute conn.halted
    end

    test "redirects to forbidden when no token in session", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{})
        |> UserAuth.fetch_current_user([])

      assert redirected_to(conn) == "/users/login"
      assert conn.halted
    end

    test "redirects to forbidden when invalid token in session", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{@cookie_name => "invalid_token"})
        |> UserAuth.fetch_current_user([])

      assert redirected_to(conn) == "/users/login"
      assert conn.halted
    end

    test "does not redirect if already on login page", %{conn: conn} do
      conn =
        conn
        |> get("/users/login")
        |> UserAuth.fetch_current_user([])

      refute conn.halted
      refute conn.assigns[:current_user]
    end
  end

  describe "get_user_from_token/1" do
    test "returns nil when token is nil" do
      assert UserAuth.get_user_from_token(nil) == nil
    end

    test "returns claims when token is valid" do
      {:ok, token, claims} = Token.generate_and_sign()

      result = UserAuth.get_user_from_token(token)

      assert result == claims
    end

    test "returns nil when token is invalid" do
      result = UserAuth.get_user_from_token("invalid_token")

      assert result == nil
    end
  end

  describe "redirect_if_user_is_authenticated/2" do
    test "redirects to signed in path when user is authenticated", %{conn: conn} do
      {:ok, token, claims} = Token.generate_and_sign()

      conn =
        conn
        |> init_test_session(%{@cookie_name => token})
        |> assign(:current_user, claims)
        |> UserAuth.redirect_if_user_is_authenticated([])

      assert redirected_to(conn) == "/"
      assert conn.halted
    end

    test "does not redirect when user is not authenticated", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{})
        |> UserAuth.redirect_if_user_is_authenticated([])

      refute conn.halted
      refute conn.assigns[:current_user]
    end

    test "does not redirect when current_user is nil", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{})
        |> assign(:current_user, nil)
        |> UserAuth.redirect_if_user_is_authenticated([])

      refute conn.halted
    end
  end

  describe "require_authenticated_user/2" do
    test "allows request to proceed when user is authenticated", %{conn: conn} do
      {:ok, token, claims} = Token.generate_and_sign()

      conn =
        conn
        |> init_test_session(%{@cookie_name => token})
        |> assign(:current_user, claims)
        |> UserAuth.require_authenticated_user([])

      refute conn.halted
      assert conn.assigns[:current_user] == claims
    end

    test "redirects to login when user is not authenticated" do
      conn =
        build_conn(:get, "/")
        |> UserAuth.require_authenticated_user([])

      assert redirected_to(conn) == "/users/login"
      assert conn.halted
    end

    test "redirects to login when current_user is nil" do
      conn =
        build_conn(:get, "/")
        |> assign(:current_user, nil)
        |> UserAuth.require_authenticated_user([])

      assert redirected_to(conn) == "/users/login"
      assert conn.halted
    end

    test "does not redirect if already on login page when user is not authenticated", %{
      conn: conn
    } do
      conn =
        conn
        |> get("/users/login")
        |> UserAuth.require_authenticated_user([])

      refute conn.halted
    end
  end

  describe "integration: full authentication flow" do
    test "login, access protected route, then logout", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{})
        |> UserAuth.log_in()

      assert redirected_to(conn) == "/"
      token = get_session(conn, @cookie_name)
      assert token != nil

      conn =
        build_conn()
        |> init_test_session(%{@cookie_name => token})
        |> UserAuth.fetch_current_user([])

      assert conn.assigns[:current_user] != nil
      refute conn.halted

      conn = UserAuth.require_authenticated_user(conn, [])
      refute conn.halted

      conn =
        build_conn()
        |> init_test_session(%{@cookie_name => token})
        |> UserAuth.log_out()

      assert redirected_to(conn) == "/users/login"
      assert conn.halted
    end

    test "unauthenticated user cannot access protected routes", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{})
        |> UserAuth.fetch_current_user([])

      assert redirected_to(conn) == "/users/login"
      assert conn.halted
      refute conn.assigns[:current_user]
    end

    test "authenticated user is redirected away from login page", %{conn: conn} do
      {:ok, token, claims} = Token.generate_and_sign()

      conn =
        conn
        |> init_test_session(%{@cookie_name => token})
        |> assign(:current_user, claims)
        |> UserAuth.redirect_if_user_is_authenticated([])

      assert redirected_to(conn) == "/"
      assert conn.halted
    end
  end
end
