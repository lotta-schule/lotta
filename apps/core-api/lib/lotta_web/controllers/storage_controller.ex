defmodule LottaWeb.StorageController do
  require Logger

  use Phoenix.Controller

  import Plug.Conn
  import Lotta.Guard

  alias Lotta.Storage

  def get_file(%{private: %{lotta_tenant: tenant}} = conn, %{"id" => id} = params)
      when not is_nil(tenant) and is_uuid(id) do
    file = Storage.get_file(id)

    if is_nil(file) do
      conn
      |> put_status(404)
      |> render(:"404")
    else
      conn
      |> put_resp_header("cache-control", "max-age=604800")
      |> redirect(
        external:
          Storage.get_http_url(
            file,
            download: !is_nil(params["download"]),
            processing: build_processing_options(params)
          )
      )
    end
  end

  def get_file(conn, _params), do: send_resp(conn, 404, "")

  def get_file_conversion(%{private: %{lotta_tenant: tenant}} = conn, %{"id" => id} = params)
      when not is_nil(tenant) and is_uuid(id) do
    file_conversion = Storage.get_file_conversion(id)

    if is_nil(file_conversion) do
      conn
      |> put_status(404)
      |> put_view(LottaWeb.ErrorView)
      |> send_resp()
    else
      conn
      |> put_resp_header("cache-control", "max-age=604800")
      |> redirect(
        external:
          Storage.get_http_url(
            file_conversion,
            download: !is_nil(params["download"]),
            processing: build_processing_options(params)
          )
      )
    end
  end

  def get_file_conversion(conn, _params), do: send_resp(conn, 404, "")

  defp build_processing_options(params) do
    processing_options =
      Enum.reduce(
        [:width, :height, :format, :fn],
        %{},
        fn key, acc ->
          value = params[to_string(key)]

          if value != nil do
            Map.put(acc, key, value)
          else
            acc
          end
        end
      )

    processing_options
  end
end
