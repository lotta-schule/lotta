defmodule ApiWeb.AbsintheHooks do
  import Plug.Conn

  def before_send(conn, %Absinthe.Blueprint{execution: %{context: %{ auth_token: token }}}) do
    # base_url_without_port = Regex.replace(~r/:\d*$/, Application.fetch_env!(:api, :base_url), "")
    conn
    |> put_resp_cookie("LottaAuth", token, max_age: 30 * 24 * 60 * 60)
  end
  def before_send(conn, _) do
    conn
  end
end