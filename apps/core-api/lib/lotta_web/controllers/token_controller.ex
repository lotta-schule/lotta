defmodule LottaWeb.TokenController do
  use LottaWeb, :controller

  require Logger

  alias Lotta.Accounts.Authentication

  action_fallback(LottaWeb.FallbackController)

  def refresh(conn, params) do
    conn =
      conn
      |> fetch_cookies()

    token = params["token"] || conn.cookies["SignInRefreshToken"]

    with token when not is_nil(token) <- token,
         {:ok, access_token, refresh_token} <-
           Authentication.refresh_token(token) do
      conn
      |> put_resp_cookie("SignInRefreshToken", refresh_token,
        http_only: true,
        same_site: "Lax",
        # 3 weeks max_age
        max_age: 3 * 7 * 24 * 60 * 60
      )
      |> render(:refresh,
        access_token: access_token,
        refresh_token: refresh_token
      )
    else
      nil ->
        Logger.warning("Refresh token not found in request or cookies.")
        {:error, :bad_request}

      {:error, reason} ->
        Logger.warning("Error when requesting refresh token exchange: #{inspect(reason)}")

        {:error, :unauthorized}
    end
  end
end
