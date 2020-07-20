defmodule ApiWeb.Auth.TokenControllerTest do
  @moduledoc false

  use ApiWeb.ConnCase, async: true

  import Api.Accounts.Authentication
  import Phoenix.ConnTest

  alias ApiWeb.Auth.AccessToken
  alias Api.Repo
  alias Api.Repo.Seeder
  alias Api.Accounts.User

  setup do
    Seeder.seed()

    web_tenant = Api.Tenants.get_tenant_by_slug!("web")

    email = "alexis.rinaldoni@lotta.schule"

    admin = Repo.get_by!(User, email: email)

    {:ok, _access_token, refresh_token} =
      create_user_tokens(admin, get_claims_for_user(admin, web_tenant))

    %{refresh_token: refresh_token, admin: admin, web_tenant: web_tenant}
  end

  describe "Exchange Cookie Refresh Tokens by an access token and a new refresh token" do
    test "should refresh a valid token if it is valid", %{refresh_token: token} do
      conn =
        build_conn()
        |> put_req_header("content-type", "application/json")
        |> put_req_cookie("SignInRefreshToken", token)
        |> post("/auth/token/refresh")
        |> fetch_cookies()

      res =
        conn
        |> json_response(200)

      new_token = conn.cookies["SignInRefreshToken"]
      refute is_nil(new_token)

      {:ok, %{"email" => email}} = AccessToken.decode_and_verify(new_token, %{"typ" => "refresh"})

      assert email == "alexis.rinaldoni@lotta.schule"

      access_token = res["accessToken"]
      refute String.valid?(access_token)

      {:ok, %{"email" => email}} =
        AccessToken.decode_and_verify(access_token, %{"typ" => "access"})

      assert email == "alexis.rinaldoni@lotta.schule"
    end

    test "should throw an error if refresh token is no valid token" do
      conn =
        build_conn()
        |> put_req_header("content-type", "application/json")
        |> put_req_cookie(
          "SignInRefreshToken",
          "Glibberisch__Glubberisch__Invalid_Something"
        )
        |> post("/auth/token/refresh")
        |> fetch_cookies()

      conn
      |> json_response(401)

      assert is_nil(conn.cookies["SignInRefreshToken"])
    end

    test "should throw an error if the signature is not valid", %{refresh_token: token} do
      token =
        token
        |> String.split(".")
        |> Enum.with_index()
        |> Enum.map(fn {token_part, i} ->
          if i < 2, do: token_part, else: String.reverse(token_part)
        end)
        |> Enum.join(".")

      conn =
        build_conn()
        |> put_req_header("content-type", "application/json")
        |> put_req_cookie("SignInRefreshToken", token)
        |> post("/auth/token/refresh")
        |> fetch_cookies()

      conn
      |> json_response(401)

      assert is_nil(conn.cookies["SignInRefreshToken"])
    end

    test "should throw an error if there is no refresh token cookie" do
      conn =
        build_conn()
        |> put_req_header("content-type", "application/json")
        |> post("/auth/token/refresh")

      conn
      |> json_response(400)

      assert is_nil(conn.cookies["SignInRefreshToken"])
    end
  end
end
