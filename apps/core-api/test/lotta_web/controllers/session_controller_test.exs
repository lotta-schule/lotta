defmodule LottaWeb.SessionControllerTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Lotta.Accounts.Authentication
  import Phoenix.ConnTest
  import Ecto.Query

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.User

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)
    email = "alexis.rinaldoni@lotta.schule"

    admin =
      Repo.one!(
        from(u in User, where: u.email == ^email),
        prefix: tenant.prefix
      )

    {:ok, _access_token, refresh_token} = create_user_tokens(admin)

    %{refresh_token: refresh_token, admin: admin, tenant: tenant}
  end

  describe "Refresh Token <-> Refresh+Access Token Exchange" do
    test "should refresh a valid token if it is valid", %{refresh_token: token} do
      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("content-type", "application/json")
        |> put_req_cookie("SignInRefreshToken", token)
        |> post("/auth/token/refresh")
        |> fetch_cookies()

      res =
        conn
        |> json_response(200)

      new_token = conn.cookies["SignInRefreshToken"]
      refute is_nil(new_token)
      refute new_token == token

      {:ok, %{"email" => email}} = AccessToken.decode_and_verify(new_token, %{"typ" => "refresh"})

      assert email == "alexis.rinaldoni@lotta.schule"

      access_token = res["accessToken"]
      assert String.valid?(access_token)

      {:ok, %{"email" => email}} =
        AccessToken.decode_and_verify(access_token, %{"typ" => "access"})

      assert email == "alexis.rinaldoni@lotta.schule"
    end

    test "should throw an error if refresh token is no valid token" do
      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("content-type", "application/json")
        |> put_req_cookie(
          "SignInRefreshToken",
          "Glibberisch__Glubberisch__Invalid_Something"
        )
        |> post("/auth/token/refresh")
        |> fetch_cookies()

      assert %{"success" => false} = json_response(conn, 401)
      assert is_nil(get_resp_cookies(conn)["SignInRefreshToken"])
    end

    test "should throw an error if the signature is not valid", %{refresh_token: token} do
      token =
        token
        |> String.split(".")
        |> Enum.with_index()
        |> Enum.map_join(
          ".",
          fn {token_part, i} ->
            if i < 2, do: token_part, else: String.reverse(token_part)
          end
        )

      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("content-type", "application/json")
        |> put_req_cookie("SignInRefreshToken", token)
        |> post("/auth/token/refresh")
        |> fetch_cookies()

      assert %{"success" => false} = json_response(conn, 401)

      assert is_nil(get_resp_cookies(conn)["SignInRefreshToken"])
    end

    test "should throw an error if there is no refresh token cookie" do
      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("content-type", "application/json")
        |> post("/auth/token/refresh")

      assert %{"success" => false} = json_response(conn, 400)
      assert is_nil(get_resp_cookies(conn)["SignInRefreshToken"])
    end
  end

  describe "Login" do
    test "should login with valid credentials and set cookies", %{admin: admin} do
      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/auth/login", %{
          "username" => admin.email,
          "password" => "password",
          "return_path" => "/"
        })
        |> fetch_cookies()

      assert redirected_to(conn) == "/"

      refresh_cookie = conn.cookies["SignInRefreshToken"]
      access_cookie = conn.cookies["SignInAccessToken"]

      refute is_nil(refresh_cookie)
      refute is_nil(access_cookie)

      {:ok, %{"email" => email}} =
        AccessToken.decode_and_verify(refresh_cookie, %{"typ" => "refresh"})

      assert email == admin.email

      {:ok, %{"email" => email}} =
        AccessToken.decode_and_verify(access_cookie, %{"typ" => "access"})

      assert email == admin.email
    end

    test "should return unauthorized with invalid credentials" do
      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/auth/login", %{
          "username" => "nonexistent@example.com",
          "password" => "wrongpassword",
          "return_path" => "/"
        })

      assert %{"success" => false} = json_response(conn, 401)
    end

    test "should use hisec token and set request_pw_reset cookie when user hasn't changed default password",
         %{
           tenant: tenant
         } do
      user_with_default_pw =
        Repo.one!(
          from(u in User, where: u.has_changed_default_password == false, limit: 1),
          prefix: tenant.prefix
        )

      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/auth/login", %{
          "username" => user_with_default_pw.email,
          "password" => "password",
          "return_path" => "/dashboard"
        })
        |> fetch_cookies()

      assert redirected_to(conn) == "/dashboard"

      access_cookie = conn.cookies["SignInAccessToken"]
      {:ok, %{"typ" => token_type}} = AccessToken.decode_and_verify(access_cookie)
      assert token_type == "hisec"

      request_pw_reset_cookie = conn.cookies["request_pw_reset"]
      assert request_pw_reset_cookie == "1"
    end

    test "should use access token and not set request_pw_reset cookie when user has changed password",
         %{
           admin: admin
         } do
      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/auth/login", %{
          "username" => admin.email,
          "password" => "password",
          "return_path" => "/dashboard"
        })
        |> fetch_cookies()

      assert redirected_to(conn) == "/dashboard"

      access_cookie = conn.cookies["SignInAccessToken"]
      {:ok, %{"typ" => token_type}} = AccessToken.decode_and_verify(access_cookie)
      assert token_type == "access"

      request_pw_reset_cookie = conn.cookies["request_pw_reset"]
      assert is_nil(request_pw_reset_cookie)
    end

    test "should default to / when return_path is not provided", %{admin: admin} do
      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/auth/login", %{
          "username" => admin.email,
          "password" => "password"
        })

      assert redirected_to(conn) == "/"
    end
  end

  describe "Logout" do
    test "should delete cookies and redirect to tenant homepage", %{
      refresh_token: token,
      tenant: tenant
    } do
      conn =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_cookie("SignInRefreshToken", token)
        |> put_req_cookie("SignInAccessToken", "some-access-token")
        |> get("/auth/logout")
        |> fetch_cookies()

      tenant_url = LottaWeb.Urls.get_tenant_url(tenant)
      assert redirected_to(conn) =~ tenant_url

      resp_cookies = conn.resp_cookies

      assert resp_cookies["SignInRefreshToken"][:max_age] == 0
      assert resp_cookies["SignInAccessToken"][:max_age] == 0
    end
  end
end
