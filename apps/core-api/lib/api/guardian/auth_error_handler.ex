defmodule Api.Guardian.AuthErrorHandler do
  @behaviour Guardian.Plug.ErrorHandler
  @impl Guardian.Plug.ErrorHandler

  def auth_error(_conn, {_type, reason}, _opts) do
    throw reason
  end
end