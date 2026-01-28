defmodule LottaWeb.SessionController do
  use LottaWeb, :controller

  require Logger

  alias Lotta.Tenants.Tenant
  alias Lotta.Accounts.Authentication
  alias Plug.Conn

  action_fallback(LottaWeb.FallbackController)

  def refresh(%Conn{} = conn, params) do
    token = params["token"] || conn.cookies["SignInRefreshToken"]

    with token when not is_nil(token) <- token,
         {:ok, access_token, refresh_token} <-
           Authentication.refresh_token(token) do
      conn
      |> put_refresh_token(refresh_token)
      |> render(:refresh,
        access_token: access_token
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

  def login(%Conn{} = conn, %{"username" => username, "password" => password} = params) do
    tenant = conn.private[:lotta_tenant]

    username
    |> Authentication.login_with_username_pass(password)
    |> case do
      {:ok, user} ->
        is_first_login = user.has_changed_default_password == false

        token_opts = if is_first_login, do: [token_type: "hisec"], else: []
        {:ok, access_token, refresh_token} = Authentication.create_user_tokens(user, token_opts)

        return_uri =
          get_return_uri(conn, params["return_url"])
          |> IO.inspect(label: "return_uri")

        conn
        |> put_refresh_token(refresh_token, is_first_login)
        |> redirect(external: IO.inspect(URI.to_string(return_uri), label: "redirect_to"))

      {:error, reason} ->
        Logger.warning("Login failed for username: #{username}: #{inspect(reason)}")
        {:error, :unauthorized}
    end
  end

  def logout(%Conn{} = conn, _params) do
    tenant = conn.private[:lotta_tenant]

    conn
    |> delete_resp_cookie("SignInRefreshToken",
      http_only: true,
      same_site: "Lax"
    )
    |> delete_resp_cookie("SignInAccessToken", same_site: "Lax")
    |> redirect(external: URI.to_string(get_return_uri(conn)))
  end

  defp get_return_uri(%Conn{} = conn, return_url \\ nil) do
    tenant = conn.private[:lotta_tenant]

    current_host =
      Enum.find_value(
        ["x-lotta-originary-host", "x-forwarded-host", "host"],
        &List.first(get_req_header(conn, &1))
      )
      |> IO.inspect(label: "current_host")

    case return_url do
      url when is_binary(url) ->
        URI.parse(url)

      _ ->
        nil
    end || URI.parse("/")
  end

  defp put_refresh_token(%Conn{} = conn, token, is_first_login \\ false) do
    conn
    |> put_first_login_cookie(is_first_login)
    |> put_resp_cookie("SignInRefreshToken", token,
      http_only: true,
      same_site: "Lax",
      max_age: 4 * 7 * 24 * 60 * 60
    )
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
