defmodule LottaWeb.Auth.ErrorHandler do
  @moduledoc """
    Authentication error handler for Guardian
  """

  require Logger

  import Plug.Conn

  @behaviour Guardian.Plug.ErrorHandler
  @impl Guardian.Plug.ErrorHandler

  def auth_error(conn, {type, reason}, opts) do
    Logger.warning("Auth-Header:", get_req_header(conn, "authorization"))
    Logger.warning("Cookies-Header", get_req_header(conn, "cookies"))

    Logger.error("Guardian error: #{inspect(type)}: #{inspect(reason)}", %{
      sentry: %{error: {type, reason}}
    })

    Logger.debug("Guardian opts: #{inspect(opts)}")

    Sentry.capture_message("Guardian error",
      extra: %{
        "guardian_error" => to_string(type),
        "guardian_reason" => to_string(reason),
        opts: inspect(opts)
      }
    )

    conn
    |> send_resp(401, Jason.encode!(%{message: to_string(type)}))
  end
end
