defmodule ApiWeb.Auth.TokenController do
  require Logger

  use Phoenix.Controller

  import Api.Accounts.Authentication

  def refresh(conn, params) do
    conn =
      conn
      |> Plug.Conn.fetch_cookies()

    token = params["token"] || conn.cookies["SignInRefreshToken"]

    if is_nil(token) do
      conn
      |> put_status(400)
      |> put_view(ApiWeb.ErrorView)
      |> render(:"400")
    else
      case refresh_token(token) do
        {:ok, access_token, refresh_token} ->
          conn
          |> json(%{
            accessToken: access_token,
            refreshToken: refresh_token
          })

        {:error, reason} ->
          Logger.warn("Error when requesting refresh token exchange: #{inspect(reason)}")

          conn
          |> put_status(401)
          |> put_view(ApiWeb.ErrorView)
          |> render(:"401")
      end
    end
  end
end
