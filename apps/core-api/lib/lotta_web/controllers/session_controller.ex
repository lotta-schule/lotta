defmodule LottaWeb.SessionController do
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

  def login(conn, %{"username" => username, "password" => password} = params) do
    return_path = params["return_path"] || "/"

    username
    |> Authentication.login_with_username_pass(password)
    |> case do
      {:ok, user} ->
        is_first_login = user.has_changed_default_password == false

        token_opts = if is_first_login, do: [token_type: "hisec"], else: []
        {:ok, access_token, refresh_token} = Authentication.create_user_tokens(user, token_opts)

        token_max_age = if(is_first_login, do: 5 * 60, else: 60 * 60)

        conn =
          conn
          |> put_resp_cookie("SignInRefreshToken", refresh_token,
            http_only: true,
            same_site: "Lax",
            max_age: 3 * 7 * 24 * 60 * 60
          )
          |> put_resp_cookie("SignInAccessToken", access_token,
            http_only: false,
            same_site: "Lax",
            max_age: token_max_age
          )

        conn =
          if is_first_login do
            put_resp_cookie(conn, "request_pw_reset", "1",
              http_only: false,
              same_site: "Lax",
              max_age: token_max_age
            )
          else
            conn
          end

        redirect(conn, external: return_path)

      {:error, reason} ->
        Logger.warning("Login failed for username: #{username}: #{inspect(reason)}")
        {:error, :unauthorized}
    end
  end

  def logout(conn, _params) do
    tenant = conn.private[:lotta_tenant]

    redirect_url =
      if tenant do
        LottaWeb.Urls.get_tenant_url(tenant)
      else
        "/"
      end

    conn
    |> delete_resp_cookie("SignInRefreshToken",
      http_only: true,
      same_site: "Lax"
    )
    |> delete_resp_cookie("SignInAccessToken", same_site: "Lax")
    |> redirect(external: redirect_url)
  end
end
