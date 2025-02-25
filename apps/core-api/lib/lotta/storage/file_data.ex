defmodule Lotta.Storage.FileData do
  @moduledoc """
  A struct representing a usergenerated file and its metadata.
  """
  alias Lotta.Storage
  require Logger

  defstruct [:stream, :_path, :metadata]

  @type metadata() :: [
          filename: String.t(),
          mime_type: String.t(),
          type: String.t(),
          size: integer()
        ]

  @type t() ::
          %__MODULE__{
            stream: Enumerable.t(),
            _path: String.t() | nil,
            metadata: metadata()
          }

  @spec from_data(data :: binary(), filename :: String.t(), opts :: [mime_type: String.t()]) ::
          {:ok, t()} | {:error, String.t()}
  def from_data(data, filename, opts \\ []) do
    mime_type = opts[:mime_type] || get_mime_type(:data, data)
    type = Storage.filetype_from(mime_type)

    {:ok,
     %__MODULE__{
       stream: :binary.bin_to_list(data) |> Stream.chunk_every(5 * 1024 * 1024),
       metadata: [
         filename: filename,
         size: byte_size(data),
         mime_type: mime_type,
         type: type
       ]
     }}
  end

  @spec from_stream(
          stream :: Enumerable.t(),
          filename :: String.t(),
          opts :: [mime_type: String.t()]
        ) ::
          {:ok, t()} | {:error, String.t()}
  def from_stream(stream, filename, opts \\ []) do
    {type, mime_type} =
      if mime_type = opts[:mime_type] do
        {Storage.filetype_from(mime_type), mime_type}
      else
        {"binary", "application/octet-stream"}
      end

    {:ok,
     %__MODULE__{
       stream: stream,
       metadata: [
         filename: filename,
         size: 0,
         mime_type: mime_type,
         type: type
       ]
     }}
  end

  @spec from_path(
          local_path :: String.t(),
          opts :: [filename: String.t(), mime_type: String.t()]
        ) ::
          {:ok, t()} | {:error, String.t()}

  def from_path(local_path, opts \\ []) do
    mime_type = opts[:mime_type] || get_mime_type(:path, local_path)
    type = Storage.filetype_from(mime_type)

    case File.stat(local_path) do
      {:ok, %File.Stat{size: size}} ->
        {:ok,
         %__MODULE__{
           _path: local_path,
           metadata: [
             filename: opts[:filename] || Path.basename(local_path),
             size: size,
             mime_type: mime_type,
             type: type
           ]
         }}

      error ->
        error
    end
  catch
    :error, reason ->
      Logger.error("Failed to read file: #{inspect(reason)}")
      {:error, "Failed to read file"}
  end

  @spec stream!(t()) :: Enumerable.t()
  def stream!(%__MODULE__{_path: path}) when not is_nil(path) do
    File.stream!(path, 5 * 1024 * 1024)
  end

  def stream!(%__MODULE__{stream: stream}) when not is_nil(stream), do: stream

  defp get_mime_type(:data, data) do
    with {:ok, pid} <- StringIO.open(data),
         {:ok, {_, mime_type}} <- FileType.from_io(pid) do
      mime_type
    else
      error ->
        Logger.error("Failed to determine content type for file: #{inspect(error)}")

        "application/octet-stream"
    end
  end

  defp get_mime_type(:path, path) do
    case FileType.from_path(path) do
      {:ok, {_, mime_type}} ->
        mime_type

      error ->
        Logger.error("Failed to determine content type for file: #{inspect(error)}")

        "application/octet-stream"
    end
  end
end
