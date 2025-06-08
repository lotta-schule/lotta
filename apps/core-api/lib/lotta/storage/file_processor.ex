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
  alias Lotta.Storage.FileProcessor.{ImageProcessor, VideoProcessor}

  @doc """
  Reads custom metadata from a file.
  """
  @spec read_metadata(FileData.t()) :: {:ok, map()} | {:error, String.t()}
  def read_metadata(%FileData{} = file_data),
    do: get_processor_module(file_data).read_metadata(file_data)

  @doc """
  Processes a file with a given format_category and returns the processed file data.
  Will return the file data, which will still need to be uploaded and persisted to the database.
  """
  @spec process_file(FileData.t(), format_category :: atom(), options :: keyword() | nil) ::
          {:ok, keyword(FileData.t())} | {:error, String.t()}
  def process_file(file_data, format_category, options \\ [])

  def process_file(file_data, format_category, options)
      when is_valid_category?(format_category) do
    target_formats =
      AvailableFormats.list(format_category)
      |> Enum.filter(fn {format, _} ->
        not Enum.member?(options[:skip] || [], to_string(format))
      end)
      |> Enum.into([])

    if target_formats == [] do
      {:error, "No formats available for category: #{format_category}"}
    else
      get_processor_module(file_data).process_multiple(file_data, target_formats)
    end
  end

  def process_file(_, format, _), do: {:error, "Invalid format category #{format}"}

  defp get_processor_module(%FileData{metadata: metadata}),
    do: get_processor_module_for_filetype(metadata[:type])

  defp get_processor_module_for_filetype("video"), do: VideoProcessor
  defp get_processor_module_for_filetype("audio"), do: VideoProcessor
  defp get_processor_module_for_filetype("image"), do: ImageProcessor
  defp get_processor_module_for_filetype(_), do: ImageProcessor
end
