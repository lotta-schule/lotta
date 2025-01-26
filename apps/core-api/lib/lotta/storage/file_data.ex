defmodule Lotta.Storage.FileData do
  @moduledoc """
  A struct representing a usergenerated file and its metadata.
  """
  require Logger

  defstruct [:raw, :local_path, :metadata]

  @type metadata() :: [
          filename: String.t(),
          content_type: String.t(),
          size: integer()
        ]

  @type t() ::
          %__MODULE__{
            raw: binary() | nil,
            local_path: String.t() | nil,
            metadata: metadata()
          }

  @spec from_data(data :: binary(), filename :: String.t(), opts :: [content_type: String.t()]) ::
          {:ok, t()} | {:error, String.t()}
  def from_data(data, filename, opts \\ []) do
    content_type =
      with nil <- opts[:content_type],
           {:ok, pid} <- StringIO.open(data),
           {:ok, {_type, mime_type}} <-
             FileType.from_io(pid) do
        mime_type
      else
        content_type when is_bitstring(content_type) ->
          content_type

        error ->
          Logger.error("Failed to determine content type for file #{filename}: #{inspect(error)}")

          "application/octet-stream"
      end

    {:ok,
     %__MODULE__{
       raw: data,
       local_path: nil,
       metadata: [
         filename: filename,
         size: byte_size(data),
         content_type: content_type
       ]
     }}
  end

  @spec from_path(
          local_path :: String.t(),
          opts :: [filename: String.t(), content_type: String.t()]
        ) ::
          {:ok, t()} | {:error, String.t()}

  def from_path(local_path, opts \\ []) do
    content_type =
      with nil <- opts[:content_type],
           {:ok, file} <- File.open(local_path, [:read, :binary]),
           {:ok, {_type, mime_type}} <-
             FileType.from_io(file) do
        mime_type
      else
        content_type when is_bitstring(content_type) ->
          content_type

        error ->
          Logger.error(
            "Failed to determine content type for file at #{local_path}: #{inspect(error)}"
          )

          "application/octet-stream"
      end

    case File.stat(local_path) do
      {:ok, %File.Stat{size: size}} ->
        {:ok,
         %__MODULE__{
           raw: nil,
           local_path: local_path,
           metadata: [
             filename: opts[:filename] || Path.basename(local_path),
             size: size,
             content_type: content_type
           ]
         }}

      error ->
        error
    end
  end

  @spec stream(file_data :: t()) :: Enumerable.t()
  def stream(%__MODULE__{local_path: path}) when not is_nil(path),
    do: File.stream!(path, 5 * 1024 * 1024)

  def stream(%__MODULE__{raw: raw}) do
    raw
    |> StringIO.open()
    |> then(fn {:ok, pid} -> IO.binstream(pid, 5 * 1024 * 1024) end)
  end
end
