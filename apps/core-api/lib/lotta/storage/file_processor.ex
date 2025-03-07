require Protocol

Protocol.derive(Jason.Encoder, Image.Exif.Gps)

defmodule Lotta.Storage.FileProcessor do
  @moduledoc """
  Module for processing conversion of incoming (uploaded) files.
  """

  require Logger

  import Lotta.Storage.Conversion.AvailableFormats, only: [is_valid_category?: 1]

  alias Lotta.Storage.FileData
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
end
