defmodule LottaWeb.Plugs.InjectAccessTokenFromCookie do
  @moduledoc """
  If no Authorization header is present, reads the SignInAccessToken cookie and
  injects it as a Bearer Authorization header so the Guardian pipeline can
  validate it via VerifyHeader.
  """

  import Plug.Conn
  alias LottaWeb.Auth.CookieHelper

  def init(opts), do: opts

  def call(conn, _opts) do
    case get_req_header(conn, "authorization") do
      [] ->
        case conn.req_cookies[CookieHelper.access_cookie()] do
          nil -> conn
          token -> put_req_header(conn, "authorization", "Bearer #{token}")
        end

      _ ->
        conn
    end
  end
end
