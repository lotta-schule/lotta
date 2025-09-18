defmodule LottaWeb.TokenControllerTest do
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

    %{refresh_token: refresh_token, admin: admin}
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
end
