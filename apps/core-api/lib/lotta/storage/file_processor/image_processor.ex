defmodule Lotta.Storage.FileProcessor.ImageProcessor do
  @moduledoc """
  Module for processing image files.
  """

  require Logger

  alias Lotta.Storage
  alias Lotta.Worker.Conversion
  alias Lotta.Storage.{File, FileData}

  @spec read_metadata(FileData.t()) :: {:ok, map()} | {:error, String.t()}
  def read_metadata(%FileData{} = file_data) do
    case Image.open(FileData.stream!(file_data)) do
      {:ok, image} ->
        exif = extract_exif(image)
        dominant_color = extract_dominant_color(image)
        {width, height, channels} = Image.shape(image)

        {:ok,
         %{
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

  @spec process_multiple(File.t(), formats :: Keyword.t()) ::
          {:ok, keyword(FileData.t())} | {:error, String.t()}
  def process_multiple(%File{} = file, formats_args \\ []) do
    with {:ok, file_data} <- File.to_file_data(file) do
      process_multiple(file_data, file, formats_args)
    end
  end

  @spec process_multiple(FileData.t(), File.t(), formats :: Keyword.t()) ::
          {:ok, keyword(FileData.t())} | {:error, String.t()}
  def process_multiple(%FileData{} = file_data, %File{} = file, formats_args) do
    with {:ok, image} <- get_image_from_file_data(file_data) do
      formats_args
      |> Enum.map(fn {format, args} ->
        {size_string, vips_args} = parse_args(args)

        with {format, file_data} when format != :error <-
               create_thumbnail_stream(format, image, size_string, vips_args),
             {:ok, file_conversion} <-
               Storage.create_file_conversion(
                 file_data,
                 file,
                 to_string(format)
               ) do
          Conversion.report_progress(file, file_conversion)

          {format, file_conversion}
        else
          {:error, error} ->
            Logger.error("Failed to process image: #{inspect(error)}")
            nil
        end
      end)
      |> Enum.filter(&(not is_nil(&1)))
      |> then(&{:ok, &1})
    end
  end

  defp create_thumbnail_stream(format, image, size_string, vips_args) do
    with {:ok, image} <- Image.thumbnail(image, size_string, vips_args),
         {:ok, file_data} <-
           get_file_data_from_image(image, "image.webp", mime_type: "image/webp") do
      {format, file_data}
    else
      {:error, error} ->
        {:error, "Failed to create thumbnail: #{inspect(error)}"}

      nil ->
        {:error, "Failed to create thumbnail: image processing returned without result"}
    end
  end

  defp get_image_from_file_data(%FileData{_path: path}),
    do: Image.open(path)

  defp get_image_from_file_data(%FileData{} = file_data),
    do: Image.open(FileData.stream!(file_data))

  defp get_file_data_from_image(image, filename, opts) do
    image
    |> Image.stream!(
      buffer_size: 8 * 1024 * 1024,
      strip_metadata: true,
      minimize_file_size: true,
      suffix: ".webp"
    )
    |> case do
      nil ->
        Logger.error("Failed to convert Image to FileData: image stream is nil")
        {:error, "Failed to convert Image to FileData"}

      stream when is_binary(stream) ->
        FileData.from_path(stream, opts)

      stream ->
        FileData.from_stream(stream, filename, opts)
    end
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
