defmodule Lotta.Storage.Conversion.AvailableFormats do
  @moduledoc """
  Module for handling file format conversions:
  Holds information about available formats and which formats to use for immediate processing.
  """

  alias Lotta.Storage
  alias Lotta.Storage.{FileData, File}

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
    articlepreview_99: [cover: [width: 99, height: 66], format: :webp, type: :image],
    articlepreview_165: [cover: [width: 165, height: 110], format: :webp, type: :image],
    articlepreview_330: [cover: [width: 330, height: 220], format: :webp, type: :image],
    articlepreview_660: [cover: [width: 660, height: 440], format: :webp, type: :image],
    articlepreview_990: [cover: [width: 990, height: 660], format: :webp, type: :image],
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
    "videoplay_480p-webm": [
      resize: [height: 480],
      format: :webm,
      video_bitrate: "0",
      crf: 40,
      audio_bitrate: "64k",
      type: :video
    ],
    "videoplay_480p-mp4": [
      resize: [width: "-2", height: 480],
      format: :mp4,
      preset: :veryfast,
      crf: 28,
      audio_bitrate: "64k",
      type: :video
    ],
    "videoplay_720p-webm": [
      resize: [height: 720],
      format: :webm,
      video_bitrate: "0",
      audio_bitrate: "96k",
      crf: 25,
      type: :video
    ],
    "videoplay_720p-mp4": [
      resize: [width: "-2", height: 720],
      format: :mp4,
      preset: :fast,
      crf: 23,
      audio_bitrate: "96k",
      type: :video
    ],
    "videoplay_1080p-webm": [
      resize: [height: 1080],
      format: :webm,
      video_bitrate: "0",
      crf: 20,
      audio_bitrate: "128k",
      type: :video
    ],
    "videoplay_1080p-mp4": [
      resize: [width: "-2", height: 1080],
      format: :mp4,
      preset: :slow,
      crf: 20,
      audio_bitrate: "128k",
      type: :video
    ]
  ]

  @audio_formats [
    audioplay_aac: [format: :aac, audio_bitrate: "192k", type: :audio],
    audioplay_ogg: [format: :ogg, audio_bitrate: "128k", type: :audio]
  ]

  @formats @preview_formats ++ @image_formats ++ @video_formats ++ @audio_formats

  @format_categories @formats
                     |> Keyword.keys()
                     |> Enum.map(fn name ->
                       name
                       |> to_string()
                       |> String.split("_")
                       |> Enum.at(0)
                       |> String.to_atom()
                     end)
                     |> Enum.uniq()

  @format_category_strings @format_categories
                           |> Enum.map(&to_string/1)

  @doc """
  Checks if a given category name is valid (= exists in the list of available categories)
  """
  @doc since: "6.0.0"
  @spec is_valid_category?(any()) :: boolean()
  defguard is_valid_category?(category_name)
           when (is_atom(category_name) and category_name in @format_categories) or
                  (is_binary(category_name) and category_name in @format_category_strings)

  @doc """
  Returns the list of available formats.
  """
  @spec list() :: [{atom(), keyword()}]
  @doc since: "6.0.0"
  def list(), do: @formats

  @doc """
  Returns the list of available formats for a given category name
  """
  @spec list(category_name :: atom()) :: [{atom(), keyword()}]
  @doc since: "6.0.0"
  def list(category_name),
    do:
      @formats
      |> Enum.filter(fn {name, _} ->
        String.starts_with?(to_string(name), to_string(category_name))
      end)

  @doc """
  Returns the given format as an atom
  """
  @spec to_atom(String.t() | atom()) :: {:ok, atom()} | {:error, :invalid_format_name}
  @doc since: "6.0.0"
  def to_atom(format) when is_binary(format) do
    try do
      {:ok, String.to_existing_atom(format)}
    rescue
      ArgumentError -> {:error, :invalid_format_name}
    end
  end

  def to_atom(format) when is_atom(format) do
    {:ok, format}
  end

  def to_atom(_) do
    {:error, :invalid_format_name}
  end

  @doc """
  Returns the category of a format.

  ## Examples

      iex> AvailableFormats.get_category(:articlepreview_840)
      :articlepreview

      iex> AvailableFormats.get_category("AVATAR_420")
      :avatar
  """
  @doc since: "6.0.0"
  @spec get_category(atom() | String.t()) :: atom() | nil
  def get_category(format) do
    format
    |> to_string()
    |> String.split("_")
    |> Enum.at(0)
    |> String.downcase()
    |> String.to_existing_atom()
    |> case do
      category when is_valid_category?(category) ->
        category

      _ ->
        nil
    end
  rescue
    ArgumentError -> nil
  end

  @doc """
  Checks if a given format is a valid format category.

  ## Examples

      iex> AvailableFormats.valid_category?(:articlepreview)
      true

      iex> AvailableFormats.valid_category?(:unknown)
      false
  """
  @doc since: "6.0.0"
  @spec valid_category?(atom() | String.t()) :: boolean()
  def valid_category?(format), do: Enum.member?(@format_categories, format)

  @doc """
  Returns the formats for a given category.

  ## Examples

      iex> AvailableFormats.get_formats_for(:articlepreview)
      [:articlepreview_840, :articlepreview_420, :articlepreview_600, :articlepreview_300]
  """
  @spec get_formats_for(atom()) :: [atom()]
  @doc since: "6.0.0"
  def get_formats_for(category) when is_atom(category) do
    @formats
    |> Enum.filter(fn {name, _} -> String.starts_with?(to_string(name), to_string(category)) end)
    |> Enum.map(&elem(&1, 0))
  end

  def get_formats_for(category), do: get_formats_for(String.to_existing_atom(category))

  @doc """
  Returns all the formats that should be immediatly available (= directly after upload) for a given file.
  """
  @doc since: "6.0.0"
  @spec get_immediate_formats(FileData.t() | String.t()) :: [atom()]
  def get_immediate_formats(%FileData{metadata: metadata}),
    do: get_immediate_formats(Keyword.get(metadata, :mime_type))

  def get_immediate_formats(%File{mime_type: mime_type}), do: get_immediate_formats(mime_type)

  def get_immediate_formats(mime_type) when is_binary(mime_type) do
    case Storage.filetype_from(mime_type) do
      "image" -> [:preview]
      "video" -> [:preview, :poster]
      "audio" -> [:preview]
      "pdf" -> [:preview]
      _ -> []
    end
  end

  @doc """
  Returns Wether a given transformation is an easy process, and can be done on the fly without
  failing the request.
  """
  @doc since: "6.0.0"
  @spec easy?(source :: File.t() | FileData.t() | String.t(), target_format :: atom()) ::
          boolean()
  def easy?(_source, target_format),
    do: Keyword.get(@formats, target_format, [])[:type] == :image

  @doc """
  Returns all available and providable formats for a given file.
  """
  @doc since: "6.0.0"
  @spec available_formats(File.t(), for_category: String.t() | atom()) :: [atom()]
  def available_formats(file, opts \\ [])

  def available_formats(%File{file_type: "image"}, opts),
    do:
      (@preview_formats ++ @image_formats)
      |> filter_for_category(opts[:for_category])
      |> Enum.map(&elem(&1, 0))

  def available_formats(%File{file_type: "video"}, opts),
    do:
      (@preview_formats ++ @video_formats)
      |> filter_for_category(opts[:for_category])
      |> Enum.map(&elem(&1, 0))

  def available_formats(%File{file_type: "audio"}, opts),
    do:
      (@preview_formats ++ @audio_formats)
      |> filter_for_category(opts[:for_category])
      |> Enum.map(&elem(&1, 0))

  def available_formats(%File{file_type: "pdf"}, opts),
    do:
      @preview_formats
      |> filter_for_category(opts[:for_category])
      |> Enum.map(&elem(&1, 0))

  def available_formats(_, _), do: []

  @doc """
  Returns all available formats for a given file, including their configuration.
  This is useful to get the configuration for a specific format.
  """
  @doc since: "6.0.0"
  @spec available_formats_with_config(File.t(), for_category: String.t() | atom()) :: [
          {atom(), map()}
        ]
  def available_formats_with_config(file, opts \\ []),
    do:
      file
      |> available_formats(opts)
      |> Enum.map(&{&1, Keyword.get(@formats, &1)})
      |> Enum.filter(&is_tuple/1)

  @doc """
  Returns a result tuple with the configuration for a given format and file.
  """
  @doc since: "6.0.0"
  @spec get_format_config(File.t(), atom()) :: {:ok, keyword()} | {:error, String.t()}
  def get_format_config(file, format_name) do
    file
    |> available_formats_with_config()
    |> Enum.find(fn {name, _} -> name == format_name end)
    |> case do
      nil -> {:error, "Format #{format_name} not available for file #{file.id}"}
      {_, config} -> {:ok, config}
    end
  end

  @doc """
  Validates if the requested format is a valid format for the given file.
  """
  @doc since: "6.0.0"
  @spec validate_requested_format(File.t(), atom() | String.t()) ::
          {:ok, atom()} | {:error, any()}
  def validate_requested_format(file, format) do
    with {:ok, format} <- to_atom(format),
         true <- Enum.member?(available_formats(file), format) do
      {:ok, format}
    else
      false ->
        {:error, :invalid_format}

      error ->
        error
    end
  end

  @doc """
  Validates if the requested format is an easy format for the given file.
  This means that the format can be transcoded on the fly and a request for it will not fail.
  """
  @doc since: "6.0.0"
  @spec validate_easy_format(File.t(), atom() | String.t()) ::
          {:ok, atom()} | {:error, :not_easy_format}
  def validate_easy_format(file, format) do
    with {:ok, format} <- to_atom(format),
         true <- easy?(file, format) do
      {:ok, format}
    else
      false ->
        {:error, :not_easy_format}

      error ->
        error
    end
  end

  @doc """
  Checks if a given format is available for a given file.
  """
  @doc since: "6.0.0"
  @spec format_available?(File.t(), atom()) :: boolean()
  def format_available?(file, format), do: Enum.member?(available_formats(file), format)

  @doc """
  Returns the default format availability for a given format. This is a theoretical value, and in
  any case, checking on the actual file is necessary to determine if a format may already be ready.

  available -> the format can be accessed via its URL and will be generated on the fly
  requestable -> the format is not available yet, but can be requested and will be generated
  """
  @doc since: "6.0.0"
  @spec get_default_availability(format :: String.t() | atom()) ::
          String.t()
  def get_default_availability(format) when is_atom(format) do
    # for now: Every image is available, every other format is requestable
    if Keyword.get(@formats, format)[:type] == :image do
      "available"
    else
      "requestable"
    end
  end

  def get_default_availability(format),
    do: get_default_availability(String.to_existing_atom(format))

  defp filter_for_category(formats, nil),
    do: formats

  defp filter_for_category(formats, category) when is_atom(category),
    do: filter_for_category(formats, to_string(category))

  defp filter_for_category(formats, category) when is_binary(category) do
    Enum.filter(formats, fn {name, _} ->
      String.starts_with?("#{name}_", String.downcase(to_string(category)) <> "_")
    end)
  end
end
