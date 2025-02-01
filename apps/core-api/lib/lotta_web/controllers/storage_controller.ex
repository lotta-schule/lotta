defmodule LottaWeb.StorageController do
  require Logger

  use Phoenix.Controller

  import Plug.Conn
  import Lotta.Guard

  alias Lotta.Storage

  def get_file_format(
        %{private: %{lotta_tenant: tenant}} = conn,
        %{"id" => id, "format" => "original"}
      )
      when not is_nil(tenant) and is_uuid(id) do
    with file when not is_nil(file) <- IO.inspect(Storage.get_file(id), label: "get_file"),
         http_url when not is_nil(http_url) <- IO.inspect(Storage.get_http_url(file), label: "get_http_url"),
         {:ok, env} <-
           Tesla.get(
             Tesla.client([{Tesla.Middleware.SSE, only: :data}]),
             http_url,
             opts: [adapter: [response: :stream]]
           ) do
      conn =
        conn
        |> copy_header(env.headers, "content-type")
        |> copy_header(env.headers, "content-length")
        |> copy_header(env.headers, "etag")
        |> copy_header(env.headers, "last-modified")
        |> put_resp_header("cache-control", "max-age=604800")
        |> send_resp(200, env.body)
    else
      error ->
        Logger.error("Failed to download file: #{inspect(error)}")

        conn
        |> respond_with(:not_found)
    end
  end

  def get_file_format(
        %{private: %{lotta_tenant: tenant}} = conn,
        %{"id" => id, "format" => format}
      )
      when not is_nil(tenant) and is_uuid(id) do
    with file when not is_nil(file) <- IO.inspect(Storage.get_file(id), label: "get_file"),
         {:ok, file_conversion} <- IO.inspect(Storage.get_file_conversion(file, format), label: "get_file_conversion"),
         http_url when not is_nil(http_url) <- IO.inspect(Storage.get_http_url(file_conversion), label: "get_http_url"),
         {:ok, env} <-
           Tesla.get(
             Tesla.client([{Tesla.Middleware.SSE, only: :data}]),
             http_url,
             opts: [adapter: [response: :stream]]
           ) do
      conn =
        conn
        |> copy_header(env.headers, "content-type")
        |> copy_header(env.headers, "content-length")
        |> copy_header(env.headers, "etag")
        |> copy_header(env.headers, "last-modified")
        |> put_resp_header("cache-control", "max-age=604800")
        |> send_resp(200, env.body)

      # env.body
      # |> Enum.chunk_every(1024)
      # |> Stream.transform(conn, fn chunk, conn ->
      # IO.inspect(chunk, label: "chunk")
      #   case Plug.Conn.chunk(conn, chunk) do
      #     {:ok, conn} -> conn
      #     {:error, _reason} -> {:halt, conn}
      #   end
      # end)
      # |> Stream.run()
    else
      nil ->
        conn
        |> respond_with(:not_found)

      error ->
        Logger.error("Failed to download file: #{inspect(error)}")

        conn
        |> respond_with(:not_found)
    end
  end

  def get_file_format(conn, _params), do: respond_with(conn, :not_found)

  def get_file(%{private: %{lotta_tenant: tenant}} = conn, %{"id" => id} = params)
      when not is_nil(tenant) and is_uuid(id) do
    with file when not is_nil(file) <- Storage.get_file(id),
         http_url when not is_nil(http_url) <-
           Storage.get_http_url(
             file,
             download: !is_nil(params["download"]),
             processing: build_processing_options(params)
           ) do
      conn
      |> put_resp_header("cache-control", "max-age=604800")
      |> redirect(external: http_url)
    else
      _ ->
        conn
        |> respond_with(:not_found)
    end
  end

  def get_file(conn, _params), do: respond_with(conn, :not_found)

  def get_file_conversion(%{private: %{lotta_tenant: tenant}} = conn, %{"id" => id} = params)
      when not is_nil(tenant) and is_uuid(id) do
    file_conversion = Storage.get_file_conversion(id)

    if is_nil(file_conversion) do
      conn
      |> respond_with(:not_found)
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

  def get_file_conversion(conn, _params), do: respond_with(conn, :not_found)

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

  defp copy_header(conn, header_list, key) do
    case Enum.find(header_list, & elem(&1, 0) == key) do
      nil -> conn
      {_, value} -> put_resp_header(conn, key, value)
    end
  end

  defp respond_with(conn, :not_found),
    do:
      conn
      |> resp(404, "")
      |> send_resp()
end
