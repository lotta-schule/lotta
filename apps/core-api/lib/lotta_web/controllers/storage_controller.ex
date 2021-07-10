defmodule LottaWeb.StorageController do
  require Logger

  use Phoenix.Controller

  import Plug.Conn

  alias Lotta.Storage

  def get_file(%{private: %{lotta_tenant: _tenant}} = conn, %{"id" => id}) do
    file = Storage.get_file(id)

    if is_nil(file) do
      conn
      |> put_status(404)
      |> put_view(LottaWeb.ErrorView)
      |> render(:"404")
    else
      url = Storage.get_http_url(file)

      # reset request_path to "/" in order for it
      # not to be appended to proxy path
      conn =
        Map.merge(conn, %{
          request_path: "",
          path_info: []
        })

      ReverseProxyPlug.call(
        conn,
        ReverseProxyPlug.init(upstream: url)
      )
    end
  end

  def get_file_conversion(%{private: %{lotta_tenant: _tenant}} = conn, %{"id" => id}) do
    file_conversion = Storage.get_file_conversion(id)

    if is_nil(file_conversion) do
      conn
      |> put_status(404)
      |> put_view(LottaWeb.ErrorView)
      |> render(:"404")
    else
      url = Storage.get_http_url(file_conversion)

      # reset request_path to "/" in order for it
      # not to be appended to proxy path
      conn =
        Map.merge(conn, %{
          request_path: "",
          path_info: []
        })

      ReverseProxyPlug.call(
        conn,
        ReverseProxyPlug.init(upstream: url)
      )
    end
  end
end
