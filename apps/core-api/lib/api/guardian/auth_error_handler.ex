defmodule Api.Guardian.AuthErrorHandler do
  @moduledoc """
    Authentication error handler for Guardian
  """

  require Logger

  import Plug.Conn

  @behaviour Guardian.Plug.ErrorHandler
  @impl Guardian.Plug.ErrorHandler

  def auth_error(conn, {type, reason}, _opts) do
    Logger.error("user authentication error:#{inspect(type)} #{inspect(reason)}")

    conn
    |> send_resp(401, Jason.encode!(%{message: to_string(type)}))
  end
end
