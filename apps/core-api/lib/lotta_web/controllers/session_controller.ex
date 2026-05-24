defmodule LottaWeb.SessionController do
  use LottaWeb, :controller

  require Logger

  alias Lotta.Accounts.Authentication
  alias LottaWeb.Auth.CookieHelper
  alias Plug.Conn

  action_fallback(LottaWeb.FallbackController)

  def refresh(%Conn{} = conn, params) do
    token =
      params["token"] || params["refreshToken"] || conn.cookies[CookieHelper.refresh_cookie()]

    with token when not is_nil(token) <- token,
         {:ok, access_token, refresh_token} <-
           Authentication.refresh_token(token) do
      conn
      |> CookieHelper.put_refresh_token(refresh_token)
      |> CookieHelper.put_access_token(access_token)
      |> render(:refresh, access_token: access_token)
    else
      nil ->
        Logger.warning("Refresh token not found in request or cookies.")
        {:error, :bad_request}

      {:error, reason} ->
        Logger.warning("Error when requesting refresh token exchange: #{inspect(reason)}")
        {:error, :unauthorized}
    end
  end

  def login(%Conn{} = conn, %{"username" => username, "password" => password} = params) do
    username
    |> Authentication.login_with_username_pass(password)
    |> case do
      {:ok, user} ->
        is_first_login = user.has_changed_default_password == false

        token_opts = if is_first_login, do: [token_type: "hisec"], else: []
        {:ok, access_token, refresh_token} = Authentication.create_user_tokens(user, token_opts)

        return_uri = get_return_uri(params["return_url"])

        conn
        |> put_first_login_cookie(is_first_login)
        |> CookieHelper.put_refresh_token(refresh_token)
        |> CookieHelper.put_access_token(access_token)
        |> redirect(external: URI.to_string(return_uri))

      {:error, reason} ->
        Logger.warning("Login failed for username: #{username}: #{inspect(reason)}")
        {:error, :unauthorized}
    end
  end

  def logout(%Conn{} = conn, _params) do
    conn
    |> CookieHelper.delete_tokens()
    |> redirect(external: URI.to_string(get_return_uri()))
  end

  defp get_return_uri(return_url \\ nil) do
    case return_url do
      url when is_binary(url) -> URI.parse(url)
      _ -> nil
    end || URI.parse("/")
  end

  defp put_first_login_cookie(%Conn{} = conn, false), do: conn

  defp put_first_login_cookie(%Conn{} = conn, true),
    do:
      conn
      |> put_resp_cookie("request_pw_reset", "1",
        http_only: false,
        same_site: "Lax",
        max_age: 5 * 60
      )
end
