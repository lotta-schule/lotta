defmodule LottaWeb.Auth.ErrorHandler do
  @moduledoc """
    Authentication error handler for Guardian
  """

  alias LottaWeb.Auth.CookieHelper

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

    CookieHelper.delete_tokens(conn)
  end
end
