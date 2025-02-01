defmodule Lotta.Storage.Conversion.AvailableFormats do
  @moduledoc """
  Module for handling file format conversions:
  Holds information about available formats and which formats to use for immediate processing.
  """

  alias Lotta.Storage.{FileData, File}

  @preview_formats [
    preview_200:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 200, height: 200], type: :image},
    preview_400:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 400, height: 400], type: :image}
  ]

  @image_formats [
    avatar_50:
      {Lotta.Storage.FileProcessor.ImageProcessor, contain: [width: 50, height: 50], type: :image},
    avatar_100:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 100, height: 100], type: :image},
    avatar_250:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 250, height: 250], type: :image},
    avatar_500:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 500, height: 500], type: :image},
    avatar_1000:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       cover: [width: 1000, height: 1000], type: :image},
    logo_300:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 300, height: 200], type: :image},
    logo_600:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 600, height: 400], type: :image},
    banner_660:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 660, height: 110], type: :image},
    banner_1320:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 1320, height: 220], type: :image},
    article_preview_300:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 300, height: 200], type: :image},
    article_preview_420:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 420, height: 280], type: :image},
    article_preview_600:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 600, height: 400], type: :image},
    article_preview_840:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 840, height: 560], type: :image}
  ]

  @video_formats [
    webm_720p:
      {Lotta.Storage.FileProcessor.VideoProcessor,
       resize: [width: 1280, height: 720], format: :webm, type: :video},
    webm_1080p:
      {Lotta.Storage.FileProcessor.VideoProcessor,
       resize: [width: 1920, height: 1080], format: :webm, type: :video},
    h264_720p:
      {Lotta.Storage.FileProcessor.VideoProcessor,
       resize: [width: 1280, height: 720], format: :h264, type: :video},
    h264_1080p:
      {Lotta.Storage.FileProcessor.VideoProcessor,
       resize: [width: 1920, height: 1080], format: :h264, type: :video}
  ]

  @formats @preview_formats ++ @image_formats ++ @video_formats

  def list(), do: @formats

  def to_atom(format) when is_binary(format) do
    try do
      {:ok, String.to_existing_atom(format)}
    rescue
      ArgumentError -> {:error, "Invalid format"}
    end
  end

  def get_immediate_formats(%FileData{metadata: metadata}),
    do: get_immediate_formats(Keyword.get(metadata, :mime_type))

  def get_immediate_formats(%File{mime_type: mime_type}), do: get_immediate_formats(mime_type)

  def get_immediate_formats(mime_type) when is_binary(mime_type) do
    cond do
      String.starts_with?(mime_type, "image/") ->
        @preview_formats

      String.starts_with?(mime_type, "video/") ->
        @preview_formats

      String.ends_with?(mime_type, "/pdf") ->
        @preview_formats

      true ->
        []
    end
    |> Enum.map(&elem(&1, 0))
  end

  @spec available_formats(File.t()) :: [atom()]
  def available_formats(%File{file_type: "image"}),
    do: Enum.map(@image_formats, &elem(&1, 0))

  def available_formats(%File{file_type: "video"}),
    do: Enum.map(@video_formats, &elem(&1, 0))

  def available_formats(_), do: []

  @spec available_formats_with_config(File.t()) :: [{atom(), map()}]
  def available_formats_with_config(file),
    do:
      file
      |> available_formats()
      |> Enum.map(&{&1, Keyword.get(@formats, &1)})
      |> Enum.filter(&is_tuple/1)

  @spec is_format_available?(File.t(), atom()) :: boolean()
  def is_format_available?(file, format), do: Enum.member?(available_formats(file), format)
end
