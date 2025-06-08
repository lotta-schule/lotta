defmodule Lotta.Storage.Conversion.AvailableFormats do
  @moduledoc """
  Module for handling file format conversions:
  Holds information about available formats and which formats to use for immediate processing.
  """

  alias Lotta.Storage
  alias Lotta.Storage.{FileData, File}

  @preview_categories [:preview, :poster]

  @preview_formats [
    preview_200: [contain: [width: 200, height: 200], format: :webp, type: :image],
    preview_400: [contain: [width: 400, height: 400], format: :webp, type: :image],
    preview_800: [
      contain: [width: 800, height: 800],
      format: :webp,
      type: :image
    ]
  ]

  @image_formats [
    present_1200: [contain: [width: 1200, height: 1200], format: :webp, type: :image],
    present_1600: [contain: [width: 1600, height: 1600], format: :webp, type: :image],
    present_2400: [contain: [width: 2400, height: 2400], format: :webp, type: :image],
    present_3200: [contain: [width: 3200, height: 3200], format: :webp, type: :image],
    avatar_50: [cover: [width: 50, height: 50], format: :webp, type: :image],
    avatar_100: [cover: [width: 100, height: 100], format: :webp, type: :image],
    avatar_250: [cover: [width: 250, height: 250], format: :webp, type: :image],
    avatar_500: [cover: [width: 500, height: 500], format: :webp, type: :image],
    avatar_1000: [cover: [width: 1000, height: 1000], format: :webp, type: :image],
    logo_300: [contain: [width: 300, height: 200], format: :webp, type: :image],
    logo_600: [contain: [width: 600, height: 400], format: :webp, type: :image],
    banner_330: [cover: [width: 330, height: 55], format: :webp, type: :image],
    banner_660: [cover: [width: 660, height: 110], format: :webp, type: :image],
    banner_990: [cover: [width: 990, height: 165], format: :webp, type: :image],
    banner_1320: [cover: [width: 1320, height: 220], format: :webp, type: :image],
    articlepreview_330: [cover: [width: 330, height: 220], format: :webp, type: :image],
    articlepreview_660: [cover: [width: 660, height: 440], format: :webp, type: :image],
    pagebg_1024: [cover: [width: 1024, height: 768], format: :webp, type: :image],
    pagebg_1280: [cover: [width: 1280, height: 960], format: :webp, type: :image],
    pagebg_1920: [cover: [width: 1920, height: 1440], format: :webp, type: :image],
    pagebg_2560: [cover: [width: 2560, height: 1920], format: :webp, type: :image],
    icon_64: [contain: [width: 64, height: 64], format: :webp, type: :image],
    icon_128: [contain: [width: 128, height: 128], format: :webp, type: :image],
    icon_256: [
      contain: [width: 256, height: 256],
      format: :webp,
      type: :image
    ]
  ]

  @video_formats [
    poster_1080p: [resize: [height: 1080], content: :poster, format: :webp, type: :image],
    "videoplay_200p-webm": [
      resize: [height: 200],
      format: :webm,
      video_bitrate: "200k",
      audio_bitrate: "64k",
      type: :video
    ],
    "videoplay_480p-webm": [
      resize: [height: 480],
      format: :webm,
      video_bitrate: "500k",
      audio_bitrate: "96k",
      type: :video
    ],
    "videoplay_720p-webm": [
      resize: [height: 720],
      format: :webm,
      video_bitrate: "1M",
      audio_bitrate: "128k",
      type: :video
    ],
    "videoplay_1080p-webm": [
      resize: [height: 1080],
      format: :webm,
      video_bitrate: "2M",
      audio_bitrate: "192k",
      type: :video
    ],
    "videoplay_200p-mp4": [
      resize: [width: "-2", height: 200],
      format: :mp4,
      preset: :veryfast,
      crf: 28,
      audio_bitrate: "64k",
      type: :video
    ],
    "videoplay_480p-mp4": [
      resize: [width: "-2", height: 480],
      format: :mp4,
      preset: :veryfast,
      crf: 28,
      audio_bitrate: "96k",
      type: :video
    ],
    "videoplay_720p-mp4": [
      resize: [width: "-2", height: 720],
      format: :mp4,
      preset: :fast,
      crf: 23,
      audio_bitrate: "128k",
      type: :video
    ],
    "videoplay_1080p-mp4": [
      resize: [width: "-2", height: 1080],
      format: :mp4,
      preset: :slow,
      crf: 20,
      audio_bitrate: "192k",
      type: :video
    ]
  ]

  @audio_formats [
    audioplay_aac: [format: :aac, audio_bitrate: "192k", type: :audio],
    audioplay_ogg: [format: :ogg, audio_bitrate: "128k", type: :audio]
  ]

  @formats @preview_formats ++ @image_formats ++ @video_formats ++ @audio_formats

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
    |> Enum.filter(fn {name, _} -> String.starts_with?(to_string(name), to_string(category)) end)
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
      "video" -> @preview_categories
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

  def available_formats(%File{file_type: "audio"}),
    do: Enum.map(@preview_formats ++ @audio_formats, &elem(&1, 0))

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
