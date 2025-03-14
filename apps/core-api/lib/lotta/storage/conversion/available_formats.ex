defmodule Lotta.Storage.Conversion.AvailableFormats do
  @moduledoc """
  Module for handling file format conversions:
  Holds information about available formats and which formats to use for immediate processing.
  """

  alias Lotta.Storage
  alias Lotta.Storage.{FileData, File}

  @preview_categories [:preview]

  @preview_formats [
    preview_200:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 200, height: 200], type: :image},
    preview_400:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 400, height: 400], type: :image},
    preview_800:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 800, height: 800], type: :image},
    preview_1200:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 1200, height: 1200], type: :image},
    preview_1600:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 1600, height: 1600], type: :image},
    preview_2400:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 2400, height: 2400], type: :image},
    preview_3200:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 3200, height: 3200], type: :image}
  ]

  @image_formats [
    avatar_50:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 50, height: 50], type: :image},
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
    banner_330:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 330, height: 55], type: :image},
    banner_660:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 660, height: 110], type: :image},
    banner_990:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 990, height: 165], type: :image},
    banner_1320:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       cover: [width: 1320, height: 220], type: :image},
    articlepreview_330:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 330, height: 220], type: :image},
    articlepreview_660:
      {Lotta.Storage.FileProcessor.ImageProcessor, cover: [width: 660, height: 440], type: :image},
    pagebg_1024:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       cover: [width: 1024, height: 768], type: :image},
    pagebg_1280:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       cover: [width: 1280, height: 960], type: :image},
    pagebg_1920:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       cover: [width: 1920, height: 1440], type: :image},
    pagebg_2560:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       cover: [width: 2560, height: 1920], type: :image},
    icon_64:
      {Lotta.Storage.FileProcessor.ImageProcessor, contain: [width: 64, height: 64], type: :image},
    icon_128:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 128, height: 128], type: :image},
    icon_256:
      {Lotta.Storage.FileProcessor.ImageProcessor,
       contain: [width: 256, height: 256], type: :image}
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

  @format_categories @formats
                     |> Enum.map(fn {name, _} ->
                       name
                       |> to_string()
                       |> String.split("_")
                       |> Enum.at(0)
                       |> String.to_atom()
                     end)
                     |> Enum.uniq()

  @doc """
  Returns the list of available formats.
  """
  @spec list() :: [{atom(), {module(), keyword()}}]
  def list(), do: @formats

  @doc """
  Returns the list of available formats for a given category name
  """
  @spec list(category_name :: atom()) :: [{atom(), {module(), keyword()}}]
  def list(category_name),
    do:
      @formats
      |> Enum.filter(fn {name, _} ->
        String.starts_with?(to_string(name), to_string(category_name))
      end)

  @doc """
  Returns the given format as an atom
  """
  @spec to_atom(String.t()) :: {:ok, atom()} | {:error, String.t()}
  def to_atom(format) when is_binary(format) do
    try do
      {:ok, String.to_existing_atom(format)}
    rescue
      ArgumentError -> {:error, "Invalid format name"}
    end
  end

  @doc """
  Returns the category of a format.

  ## Examples

      iex> AvailableFormats.get_category(:articlepreview_840)
      :articlepreview
  """
  @spec get_category(atom()) :: {:ok, atom()} | nil
  def get_category(format) when is_atom(format) do
    format
    |> to_string()
    |> String.split("_")
    |> Enum.at(0)
    |> String.to_existing_atom()
  end

  def get_category(format), do: get_category(String.to_existing_atom(format))

  def valid_category?(format), do: Enum.member?(@format_categories, format)

  @doc """
  Returns the formats for a given category.

  ## Examples

      iex> AvailableFormats.get_formats_for(:articlepreview)
      [:articlepreview_840, :articlepreview_420, :articlepreview_600, :articlepreview_300]
  """
  @spec get_formats_for(atom()) :: [atom()]
  def get_formats_for(category) when is_atom(category) do
    @formats
    |> Enum.filter(fn {name, _} -> String.starts_with?(name, to_string(category)) end)
    |> Enum.map(&elem(&1, 0))
  end

  def get_formats_for(category), do: get_formats_for(String.to_existing_atom(category))

  @doc """
  Returns all the formats that should be immediatly available (= directly after upload) for a given file.
  """
  @spec get_immediate_formats(FileData.t() | String.t()) :: [atom()]
  def get_immediate_formats(%FileData{metadata: metadata}),
    do: get_immediate_formats(Keyword.get(metadata, :mime_type))

  def get_immediate_formats(%File{mime_type: mime_type}), do: get_immediate_formats(mime_type)

  def get_immediate_formats(mime_type) when is_binary(mime_type) do
    case Storage.filetype_from(mime_type) do
      "image" -> @preview_categories
      "pdf" -> @preview_categories
      _ -> []
    end
  end

  @doc """
  Returns all available and providable formats for a given file.
  """
  @spec available_formats(File.t()) :: [atom()]
  def available_formats(%File{file_type: "image"}),
    do: Enum.map(@preview_formats ++ @image_formats, &elem(&1, 0))

  def available_formats(%File{file_type: "video"}),
    do: Enum.map(@preview_formats ++ @video_formats, &elem(&1, 0))

  def available_formats(%File{file_type: "pdf"}),
    do: Enum.map(@preview_formats, &elem(&1, 0))

  def available_formats(_), do: []

  @spec available_formats_with_config(File.t()) :: [{atom(), map()}]
  def available_formats_with_config(file),
    do:
      file
      |> available_formats()
      |> Enum.map(&{&1, Keyword.get(@formats, &1)})
      |> Enum.filter(&is_tuple/1)

  @doc """
  Checks if a given format is available for a given file.
  """
  @spec format_available?(File.t(), atom()) :: boolean()
  def format_available?(file, format), do: Enum.member?(available_formats(file), format)

  @doc """
  Checks if a given category name is valid (= exists in the list of available categories)
  """
  @spec is_valid_category?(any()) :: boolean()
  defguard is_valid_category?(category_name)
           when is_atom(category_name) and category_name in @format_categories
end
