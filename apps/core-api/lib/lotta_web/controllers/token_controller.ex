defmodule LottaWeb.TokenController do
  require Logger

  use Phoenix.Controller

  import Plug.Conn

  alias Lotta.Accounts.Authentication

  def refresh(conn, params) do
    conn =
      conn
      |> fetch_cookies()

    IO.inspect(conn.cookies)
    IO.inspect(params)
    token = params["token"] || conn.cookies["SignInRefreshToken"]
    IO.inspect(token)

    if is_nil(token) do
      IO.inspect("IS NIL: TOKEN")
      conn
      |> put_status(400)
      |> put_view(LottaWeb.ErrorView)
      |> render(:"400")
    else
      case Authentication.refresh_token(token) do
        {:ok, access_token, refresh_token} ->
          conn
          |> put_resp_cookie("SignInRefreshToken", refresh_token,
            http_only: true,
            same_site: "Lax",
            # 3 weeks max_age
            max_age: 3 * 7 * 24 * 60 * 60
          )
          |> json(%{
            accessToken: access_token,
            refreshToken: refresh_token
          })

        {:error, reason} ->
          Logger.warn("Error when requesting refresh token exchange: #{inspect(reason)}")

          conn
          |> put_status(401)
          |> delete_resp_cookie("SignInRefreshToken",
            http_only: true,
            same_site: "Lax"
          )
          |> put_view(LottaWeb.ErrorView)
          |> render(:"401")
      end
    end
  end
end
