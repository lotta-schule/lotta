require Protocol

Protocol.derive(Jason.Encoder, Image.Exif.Gps)

defmodule Lotta.Storage.FileProcessor do
  @moduledoc """
  Module for processing conversion of incoming (uploaded) files.
  """

  require Logger

  import Lotta.Storage.Conversion.AvailableFormats, only: [is_valid_category?: 1]

  alias Lotta.Storage.{File, FileData}
  alias Lotta.Storage.Conversion.AvailableFormats
  alias Lotta.Storage.FileProcessor.ImageProcessor

  @doc """
  Reads custom metadata from a file.
  """
  @spec read_metadata(FileData.t()) :: {:ok, map()} | {:error, String.t()}
  def read_metadata(%FileData{metadata: metadata} = file_data) do
    case Keyword.get(metadata, :type) do
      "image" -> ImageProcessor.read_metadata(file_data)
      _ -> {:error, "Unsupported file type"}
    end
  end

  @doc """
  Converts the file to all formats that should be immediatly available.
  Will return filedata objects, which will still need to be uploaded and persisted to the database.
  """
  @spec convert_immediate_formats(FileData.t()) :: [{:ok, FileData.t()}] | [{:error, String.t()}]
  def convert_immediate_formats(%FileData{} = file_data) do
    file_data
    |> AvailableFormats.get_immediate_formats()
    |> Task.async_stream(&process_file(file_data, &1))
    |> Enum.to_list()
    |> Enum.map(fn
      {:ok, result} ->
        result

      {:error, error} ->
        Logger.error("Failed to process file: #{inspect(error)}")
        {:error, error}
    end)
    |> Enum.filter(fn
      {:ok, _} -> true
      _ -> false
    end)
    |> Enum.map(&elem(&1, 1))
  end

  @doc """
  Processes a file with a given format_category and returns the processed file data.
  Will return the file data, which will still need to be uploaded and persisted to the database.
  """
  @spec process_file(FileData.t(), format_category :: atom()) ::
          {:ok, keyword(FileData.t())} | {:error, String.t()}
  def process_file(file_data, format_category) when is_valid_category?(format_category) do
    AvailableFormats.list(format_category)
    |> Enum.reduce({:ok, nil}, fn
      _, {:error, _} = error ->
        error

      {format, {next_processor_module, args}}, {:ok, nil} ->
        {:ok, {next_processor_module, [{format, args}]}}

      {format, {next_processor_module, args}}, {:ok, {processor_module, format_list}}
      when next_processor_module == processor_module ->
        {:ok, {next_processor_module, [{format, args} | format_list]}}

      {format, {next_processor_module, _}}, _ ->
        {:error,
         "Invalid format: #{format} for category: #{format_category}. #{next_processor_module} is not allowed"}
    end)
    |> case do
      {:ok, nil} ->
        {:error, "No formats found for category: #{format_category}"}

      {:ok, {next_processor_module, format_list}} ->
        next_processor_module.process(file_data, format_list)

      {:error, error} ->
        {:error, error}
    end
  end

  def process_file(_, format), do: {:error, "Invalid format category #{format}"}

  @doc """
  Caches a given file object to disk, to be used for later conversion
  """
  @spec cache_file(File.t(), FileData.t()) :: {:ok, FileData.t()} | {:error, String.t()}
  def cache_file(%File{id: id, mime_type: mime_type}, %FileData{_path: file_path}) do
    with tmp_path <- System.tmp_dir() || {:error, "Failed to get tmp path"},
         local_file_path <-
           Path.join(tmp_path, "file-cache-#{id}"),
         false <-
           Elixir.File.exists?(local_file_path) and
             FileData.from_path(local_file_path, mime_type: mime_type),
         :ok <- Elixir.File.cp(file_path, local_file_path) do
      FileData.from_path(local_file_path, mime_type: mime_type)
    else
      :error ->
        Logger.error("Failed to get valid cache path for file: #{inspect(id)}")
        {:error, "Failed to get valid cache path for file"}

      error ->
        error
    end
  end

  def cache_file(_, %FileData{}), do: {:error, "Only local files can be cached"}

  @doc """
  Retrieves a cached file object from disk. If the file is not found, it will return nil
  """
  @spec get_cached(File.t()) :: FileData.t() | nil
  def get_cached(%File{id: id, mime_type: mime_type}) do
    with tmp_path <- System.tmp_dir() || {:error, "Failed to get tmp path"},
         local_file_path <-
           Path.join(tmp_path, "file-cache-#{id}"),
         true <- Elixir.File.exists?(local_file_path) || nil,
         {:ok, cached_file_data} <- FileData.from_path(local_file_path, mime_type: mime_type) do
      cached_file_data
    else
      {:error, error} ->
        Logger.error("Failed to get cached file: #{inspect(error)}")
        nil

      _ ->
        nil
    end
  end
end
