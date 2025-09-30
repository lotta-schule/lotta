defmodule LottaWeb.StorageController do
  require Logger

  use LottaWeb, :controller

  import Lotta.Guard

  alias Lotta.Storage
  alias Lotta.Storage.Conversion.AvailableFormats

  def get_file_format(
        %{private: %{lotta_tenant: tenant}} = conn,
        %{"id" => id, "format" => "original"}
      )
      when not is_nil(tenant) and is_uuid(id) do
    with file when not is_nil(file) <- Storage.get_file(id, preload: [:remote_storage_entity]),
         http_url when not is_nil(http_url) <-
           Storage.get_http_url(file),
         {:ok, env} <-
           Tesla.get(
             http_url,
             opts: [adapter: [response: :stream]]
           ) do
      conn =
        conn
        |> copy_header(env.headers, "content-type")
        |> copy_header(env.headers, "etag")
        |> copy_header(env.headers, "last-modified")
        |> put_resp_header("cache-control", "max-age=604800")
        |> send_chunked(200)

      Enum.reduce_while(env.body, conn, fn chunk, conn ->
        case chunk(conn, chunk) do
          {:ok, conn} ->
            {:cont, conn}

          {:error, reason} ->
            Logger.error("Failed to stream file to user: #{inspect(reason)}")
            {:halt, conn}
        end
      end)
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
    with file when not is_nil(file) <- Storage.get_file(id),
         {:ok, _format} <-
           AvailableFormats.validate_requested_format(file, format),
         {:ok, file_conversion} <-
           Storage.get_file_conversion(file, format, create: :easy_format),
         http_url when not is_nil(http_url) <-
           Storage.get_http_url(file_conversion),
         {:ok, env} <-
           Tesla.get(
             http_url,
             opts: [adapter: [response: :stream]]
           ) do
      conn =
        conn
        |> copy_header(env.headers, "content-type")
        |> copy_header(env.headers, "etag")
        |> copy_header(env.headers, "last-modified")
        |> put_resp_header("cache-control", "max-age=604800")
        |> send_chunked(200)

      Enum.reduce_while(env.body, conn, fn chunk, conn ->
        case chunk(conn, chunk) do
          {:ok, conn} ->
            {:cont, conn}

          {:error, reason} ->
            Logger.error("Failed to stream file to user: #{inspect(reason)}")
            {:halt, conn}
        end
      end)
    else
      nil ->
        conn
        |> respond_with(:not_found)

      {:error, "Conversion job timed out"} ->
        conn
        |> respond_with(:service_unavailable)

      {:error, :invalid_foramt} ->
        conn
        |> respond_with(:not_found)

      {:error, :not_easy_format} ->
        conn
        |> respond_with(:precondition_required)

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
    case Enum.find(header_list, &(elem(&1, 0) == key)) do
      nil -> conn
      {_, value} -> put_resp_header(conn, key, value)
    end
  end

  defp respond_with(conn, status_code) when is_integer(status_code),
    do:
      conn
      |> resp(status_code, "")
      |> send_resp()

  defp respond_with(conn, :not_found),
    do: respond_with(conn, 404)

  defp respond_with(conn, :precondition_required),
    do: respond_with(conn, 428)

  defp respond_with(conn, :service_unavailable),
    do: respond_with(conn, 503)

  defp respond_with(conn, :internal_server_error),
    do: respond_with(conn, 500)
end
