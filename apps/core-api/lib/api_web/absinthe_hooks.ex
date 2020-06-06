defmodule ApiWeb.AbsintheHooks do
  import Plug.Conn

  def before_send(conn, %Absinthe.Blueprint{execution: %{context: %{auth_token: nil}}}) do
    conn
    |> delete_resp_cookie("LottaAuth")
  end

  def before_send(conn, %Absinthe.Blueprint{execution: %{context: %{auth_token: token}}}) do
    conn
    |> put_resp_cookie("LottaAuth", token, max_age: 30 * 24 * 60 * 60)
  end

  def before_send(conn, _) do
    conn
  end
end
