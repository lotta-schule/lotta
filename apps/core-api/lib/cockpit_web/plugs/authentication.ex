defmodule CockpitWeb.Plug.Authentication do
  import Plug.Conn

  def init(opts), do: opts

  def authenticated?(conn) do
    conn
    |> get_req_header("authentication")
    |> case do
      ["Bearer " <> key] ->
        admin_key_is_valid?(key)

      _ ->
        false
    end
  end

  def admin_key_is_valid?(key) do
    IO.inspect(key)
    api_config = Application.fetch_env!(:lotta, :cockpit)
    Keyword.get(api_config, :admin_api_key) == key
  end

  def call(conn, _opts) do
    if authenticated?(conn) do
      conn
    else
      conn
      |> send_resp(401, Jason.encode!(%{errors: [%{message: "API key not valid"}]}))
      |> halt
    end
  end
end
