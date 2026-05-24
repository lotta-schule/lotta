defmodule LottaWeb.Auth.CookieHelper do
  @moduledoc false

  @access_cookie "SignInAccessToken"
  @refresh_cookie "SignInRefreshToken"
  @max_age 21 * 24 * 60 * 60

  def put_access_token(%Plug.Conn{} = conn, token) do
    Plug.Conn.put_resp_cookie(conn, @access_cookie, token,
      http_only: true,
      secure: conn.scheme == :https,
      same_site: "Lax",
      max_age: @max_age
    )
  end

  def put_refresh_token(%Plug.Conn{} = conn, token) do
    Plug.Conn.put_resp_cookie(conn, @refresh_cookie, token,
      http_only: true,
      secure: conn.scheme == :https,
      same_site: "Lax",
      max_age: @max_age
    )
  end

  def delete_access_token(%Plug.Conn{} = conn) do
    Plug.Conn.delete_resp_cookie(conn, @access_cookie,
      http_only: true,
      same_site: "Lax"
    )
  end

  def delete_refresh_token(%Plug.Conn{} = conn) do
    Plug.Conn.delete_resp_cookie(conn, @refresh_cookie,
      http_only: true,
      same_site: "Lax"
    )
  end

  def delete_tokens(%Plug.Conn{} = conn) do
    conn
    |> delete_access_token()
    |> delete_refresh_token()
  end

  def access_cookie, do: @access_cookie
  def refresh_cookie, do: @refresh_cookie
end
