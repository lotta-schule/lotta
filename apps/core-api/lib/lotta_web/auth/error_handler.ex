defmodule LottaWeb.Auth.ErrorHandler do
  @moduledoc """
    Authentication error handler for Guardian
  """

  require Logger

  import Plug.Conn

  @behaviour Guardian.Plug.ErrorHandler
  @impl Guardian.Plug.ErrorHandler

  def auth_error(conn, {type, reason}, opts) do
    Sentry.capture_message("Guardian error",
      extra: %{
        "guardian_error" => inspect(type),
        "guardian_reason" => inspect(reason),
        opts: inspect(opts)
      }
    )

    conn
    |> delete_resp_cookie("SignInRefreshToken",
      http_only: true,
      same_site: "Lax"
    )
  end
end
