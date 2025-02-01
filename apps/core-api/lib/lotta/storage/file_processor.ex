require Protocol

Protocol.derive(Jason.Encoder, Image.Exif.Gps)

defmodule Lotta.Storage.FileProcessor do
  @moduledoc """
  Module for processing conversion of incoming (uploaded) files.
  """

  require Logger

  alias Lotta.Storage.{FileData, File, FileConversion}
  alias Lotta.Storage.Conversion.AvailableFormats
  alias Lotta.Storage.FileProcessor.ImageProcessor

  @spec read_metadata(FileData.t()) :: {:ok, map()} | {:error, String.t()}
  def read_metadata(%FileData{metadata: metadata} = file_data) do
    case Keyword.get(metadata, :type) do
      "image" -> ImageProcessor.read_metadata(file_data)
      _ -> {:error, "Unsupported file type"}
    end
  end

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

  @spec process_file(FileData.t(), format :: atom()) ::
          {:ok, FileData.t()} | {:error, String.t()}
  def process_file(file_data, format) do
    with {processor_module, args} <- Keyword.get(AvailableFormats.list(), format),
         {:ok, processed_file_data} <- processor_module.process(file_data, args) do
      {:ok, {format, processed_file_data}}
    else
      nil ->
        {:error, "Invalid format"}

      error ->
        error
    end
  end
end
