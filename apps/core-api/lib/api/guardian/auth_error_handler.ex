defmodule Api.Guardian.AuthErrorHandler do
  @behaviour Guardian.Plug.ErrorHandler
  @impl Guardian.Plug.ErrorHandler

  def auth_error(conn, {type, reason}, opts) do
    throw reason
  end
end