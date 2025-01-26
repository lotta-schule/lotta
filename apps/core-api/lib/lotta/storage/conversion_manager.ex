defmodule Lotta.Storage.ConversionManager do
  @moduledoc """
  Module for processing conversion of incoming (uploaded) files.
  """

  require Logger

  alias Lotta.Storage.{FileData, File}

  @image_formats [
    preview_200: {Lotta.Storage.FileProcessor.ImageProcessor, contain: [width: 200, height: 200]},
    preview_400: {Lotta.Storage.FileProcessor.ImageProcessor, contain: [width: 400, height: 400]},
    avatar_50: {Lotta.Storage.FileProcessor.ImageProcessor, contain: [width: 50, height: 50]},
    avatar_100: {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 100, height: 100]},
    avatar_250: {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 250, height: 250]},
    avatar_500: {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 500, height: 500]},
    avatar_1000: {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 1000, height: 1000]}
  ]

  @video_formats [
    webm_720p:
      {Lotta.Storage.FileProcessor.VideoProcessor,
       resize: [width: 1280, height: 720], format: :webm},
    webm_1080p:
      {Lotta.Storage.FileProcessor.VideoProcessor,
       resize: [width: 1920, height: 1080], format: :webm},
    h264_720p:
      {Lotta.Storage.FileProcessor.VideoProcessor,
       resize: [width: 1280, height: 720], format: :h264},
    h264_1080p:
      {Lotta.Storage.FileProcessor.VideoProcessor,
       resize: [width: 1920, height: 1080], format: :h264}
  ]

  @formats @image_formats ++ @video_formats

  @default_formats [:preview_200, :preview_400]

  def get_immediate_formats(%FileData{metadata: metadata}) do
    content_type = Keyword.get(metadata, :content_type)

    cond do
      String.starts_with?(content_type, "image/") ->
        @default_formats

      String.starts_with?(content_type, "video/") ->
        @default_formats

      String.ends_with?(content_type, "/pdf") ->
        @default_formats
    end
  end

  def available_formats(%File{file_type: "image"}),
    do: @image_formats

  def available_formats(%File{file_type: "video"}),
    do: @video_formats

  def available_formats(_),
    do: []

  def convert_immediate_formats(%FileData{} = file_data) do
    results =
      file_data
      |> get_immediate_formats()
      |> Task.async_stream(&process_file(file_data, &1))
      |> Enum.to_list()

    Enum.map(results, fn
      {:ok, result} ->
        result

      {:error, error} ->
        Logger.error("Failed to process file: #{inspect(error)}")
        {:error, error}
    end)
  end

  @spec process_file(FileData.t(), format :: atom()) ::
          {:ok, FileData.t()} | {:error, String.t()}
  def process_file(file_data, format) do
    with {processor_module, args} <- Keyword.get(@formats, format),
         {:ok, processed_file_data} <- processor_module.process(file_data, args) do
      {:ok, {format, processed_file_data}}
    else
      error ->
        error
    end
  end

  # @spec process_file(File.t(), format :: atom()) :: :ok | {:error, String.t()}
  # def process_file(file, format) do
  #   with {processor_module, args} when is_reference(processor_module) <-
  #          Keyword.get(@formats, format) do
  #     processor_module.process(file, args)
  #   else
  #     _ -> {:error, "Invalid format"}
  #   end
  # end
end
