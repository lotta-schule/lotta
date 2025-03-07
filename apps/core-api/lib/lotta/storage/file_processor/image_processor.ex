defmodule Lotta.Storage.FileProcessor.ImageProcessor do
  @moduledoc """
  Module for processing image files.
  """

  require Logger

  alias Lotta.Storage.FileData

  @spec read_metadata(FileData.t()) :: {:ok, map()} | {:error, String.t()}
  def read_metadata(%FileData{} = file_data) do
    case Image.open(FileData.stream!(file_data)) do
      {:ok, image} ->
        blurhash = generate_blurhash(image)
        dhash = generate_dhash(image)
        exif = extract_exif(image)
        dominant_color = extract_dominant_color(image)
        {width, height, channels} = Image.shape(image)

        {:ok,
         %{
           dhash: dhash,
           blurhash: blurhash,
           exif: exif,
           dominant_color: dominant_color,
           pages: Image.pages(image),
           width: width,
           height: height,
           channels: channels
         }}

      error ->
        error
    end
  catch
    :error, reason ->
      {:error, reason}
  end

  @spec process(FileData.t(), Keyword.t()) ::
          {:ok, keyword(FileData.t())} | {:error, String.t()}
  def process(%FileData{} = file_data, formats_args) do
    with {:ok, image} <- Image.open(FileData.stream!(file_data)) do
      formats_args
      |> Enum.map(fn {format, args} ->
        {size_string, vips_args} = parse_args(args)
        create_thumbnail_stream(format, image, size_string, vips_args)
      end)
      |> Enum.filter(&(not is_nil(&1)))
      |> then(&{:ok, &1})
    end
  end

  defp create_thumbnail_stream(format, image, size_string, vips_args) do
    Image.thumbnail(image, size_string, vips_args)
    |> then(fn
      {:ok, image} ->
        Image.stream!(image,
          buffer_size: 8 * 1024 * 1024,
          strip_metadata: true,
          minimize_file_size: true,
          suffix: ".webp"
        )
        |> FileData.from_stream("image.webp", mime_type: "image/webp")
        |> case do
          {:ok, file_data} ->
            {format, file_data}

          {:error, error} ->
            Logger.error("Failed to process image: #{inspect(error)}")
            nil
        end

      {:error, error} ->
        Logger.error("Failed to process image: #{inspect(error)}")
        nil
    end)
  end

  defp to_hex_color(value) when is_list(value) do
    "#" <>
      Enum.reduce(value, "", fn value, acc ->
        acc <> String.pad_leading(Integer.to_string(value, 16), 2, "0")
      end)
  end

  defp parse_args(args) do
    [:contain, :cover]
    |> Enum.find(&Keyword.has_key?(args, &1))
    |> case do
      nil ->
        raise ArgumentError,
              "#{__MODULE__}.process: invalid arguments: image arg must have :contain or :cover key"

      fit_arg ->
        {create_size_string(args[fit_arg]), create_vips_args(fit: fit_arg)}
    end
  end

  defp generate_blurhash(image) do
    case Image.Blurhash.encode(image) do
      {:ok, blurhash} ->
        blurhash

      _error ->
        nil
    end
  end

  defp generate_dhash(image) do
    case Image.dhash(image) do
      {:ok, dhash} ->
        dhash
        |> :binary.bin_to_list()
        |> to_hex_color()

      _error ->
        nil
    end
  end

  defp extract_exif(image) do
    case Image.exif(image) do
      {:ok, exif} -> exif
      _error -> nil
    end
  end

  defp extract_dominant_color(image) do
    case Image.dominant_color(image) do
      {:ok, color} ->
        to_hex_color(color)

      _error ->
        nil
    end
  end

  defp create_size_string(size_args) do
    height = Keyword.get(size_args, :height)
    width = Keyword.get(size_args, :width)

    case {height, width} do
      {nil, nil} ->
        raise ArgumentError,
              "#{__MODULE__}.create_size_string: invalid arguments: image arg must have :height or :width set"

      {nil, w} ->
        w

      {h, nil} ->
        h

      {h, w} ->
        "#{w}x#{h}"
    end
  end

  defp create_vips_args(args) do
    default_args = [autorotate: true]

    Keyword.merge(default_args, args)
  end
end
