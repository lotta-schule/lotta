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

  @spec from_stream(
          stream :: Enumerable.t(),
          filename :: String.t(),
          opts :: [mime_type: String.t()]
        ) ::
          {:ok, t()} | {:error, String.t()}
  def from_stream(stream, filename, opts \\ []) do
    mime_type = opts[:mime_type] || guess_mime_type(:path, filename)
    type = Storage.filetype_from(mime_type)

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
          opts :: [filename: String.t(), mime_type: String.t(), file: Storage.File.t()]
        ) ::
          {:ok, t()} | {:error, String.t()}

  def from_path(local_path, opts \\ []) do
    mime_type = opts[:mime_type] || guess_mime_type(:path, local_path)
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
    File.stream!(path, 8 * 1024 * 1024)
  end

  def stream!(%__MODULE__{stream: stream}) when not is_nil(stream), do: stream

  @doc """
  Copy the current file data to a file on disk, returning the newly created file data.
  """
  @spec copy_to_file(t(), path :: String.t()) :: {:ok, t()} | {:error, String.t()}
  def copy_to_file(%__MODULE__{stream: stream} = file_data, path) when not is_nil(stream) do
    stream
    |> Stream.into(File.stream!(path))
    |> Stream.run()
    |> then(fn :ok ->
      from_path(path, file_data.metadata)
    end)
  end

  def copy_to_file(%__MODULE__{_path: path} = file_data, new_path) when not is_nil(path) do
    case File.cp(path, new_path) do
      :ok ->
        {:ok, %__MODULE__{file_data | _path: new_path}}

      error ->
        Logger.error("Failed to copy file: #{inspect(error)}")
        {:error, "Failed to copy file"}
    end
  end

  defp guess_mime_type(:path, path) do
    case FileType.from_path(path) do
      {:ok, {_, mime_type}} ->
        mime_type

      _ ->
        MIME.from_path(path)
    end
  end

  @doc """
  Caches a given file object to disk, to be used for later conversion
  """
  @spec cache(t(), [{:for, Storage.File.t()}]) :: {:ok, t()} | {:error, String.t()}
  def cache(%__MODULE__{} = file_data, [{:for, %Storage.File{} = file}]) do
    if local_path = cache_path(file) do
      copy_to_file(file_data, local_path)
    else
      {:error, "Failed to get cache path"}
    end
  end

  @doc """
  Caches a given file object to disk, to be used for later conversion
  """
  @spec caching(t(), [{:for, Storage.File.t()}]) :: Storage.File.t()
  def caching(%__MODULE__{} = file_data, [{:for, %Storage.File{} = file}]) do
    case cache(file_data, [{:for, file}]) do
      {:ok, cached} -> cached
      {:error, _} -> file
    end
  end

  @doc """
  Retrieves a cached file object from disk. If the file is not found, it will return nil
  """
  @spec get_cached([{:for, Storage.File.t()}]) :: t() | nil
  def get_cached([{:for, %Storage.File{} = file}]) do
    with local_path when is_binary(local_path) <- cache_path(file),
         {:ok, file_data} <- from_path(local_path, mime_type: file.mime_type) do
      file_data
    else
      _ -> nil
    end
  end

  @doc """
  Deletes a cached file object from disk, if it exists
  """
  @spec clear(t() | [{:for, Storage.File.t()}]) :: :ok | {:error, File.posix()}
  def clear(%__MODULE__{_path: path}) when is_binary(path), do: File.rm(path)
  def clear(%__MODULE__{}), do: :ok

  def clear({:for, %Storage.File{} = file}) do
    if local_path = cache_path(file),
      do: File.rm(local_path),
      else: :ok
  end

  def create_cache_dir(), do: File.mkdir_p!(Path.join(System.tmp_dir(), "ugc"))

  defp cache_path(%Storage.File{} = file) do
    if tmp_path = System.tmp_dir() do
      filename =
        Enum.join(
          [
            Ecto.get_meta(file, :prefix),
            file.id,
            "original"
          ],
          "_"
        )

      Path.join([tmp_path, "ugc", filename])
    end
  end
end

defimpl String.Chars, for: Lotta.Storage.FileData do
  def to_string(file_data) do
    case file_data do
      %Lotta.Storage.FileData{_path: path, metadata: metadata} when not is_nil(path) ->
        "FileData<#{inspect(path)}>(#{inspect(metadata)})"

      %Lotta.Storage.FileData{stream: stream, metadata: metadata} when not is_nil(stream) ->
        "FileData<stream>(#{inspect(metadata)}"

      _ ->
        "FileData<unknown>"
    end
  end
end
