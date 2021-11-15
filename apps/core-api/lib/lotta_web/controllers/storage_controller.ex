defmodule LottaWeb.StorageController do
  require Logger

  use Phoenix.Controller

  import Plug.Conn

  alias Lotta.Storage

  def get_file(%{private: %{lotta_tenant: _tenant}} = conn, %{"id" => id} = params) do
    file = Storage.get_file(id)

    if is_nil(file) do
      conn
      |> put_status(404)
      |> put_view(LottaWeb.ErrorView)
      |> render(:"404")
    else
      redirect(conn, external: Storage.get_http_url(file, download: !is_nil(params["download"])))
    end
  end

  def get_file_conversion(%{private: %{lotta_tenant: _tenant}} = conn, %{"id" => id} = params) do
    file_conversion = Storage.get_file_conversion(id)

    if is_nil(file_conversion) do
      conn
      |> put_status(404)
      |> put_view(LottaWeb.ErrorView)
      |> render(:"404")
    else
      redirect(conn,
        external: Storage.get_http_url(file_conversion, download: !is_nil(params["download"]))
      )
    end
  end
end
