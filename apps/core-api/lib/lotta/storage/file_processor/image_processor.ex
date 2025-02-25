defmodule Lotta.Storage.FileProcessor.ImageProcessor do
  @moduledoc """
  Module for processing image files.
  """

  alias Lotta.Storage.FileData

  defp to_hex_color(value) when is_list(value) do
    "#" <>
      Enum.reduce(value, "", fn value, acc ->
        acc <> String.pad_leading(Integer.to_string(value, 16), 2, "0")
      end)
  end

  @spec read_metadata(FileData.t()) :: {:ok, map()} | {:error, String.t()}
  def read_metadata(%FileData{} = file_data) do
    case Image.open(FileData.stream!(file_data)) do
      {:ok, image} ->
        dhash =
          case Image.dhash(image) do
            {:ok, dhash} ->
              dhash
              |> :binary.bin_to_list()
              |> to_hex_color()

            _error ->
              nil
          end

        exif =
          case Image.exif(image) do
            {:ok, exif} -> exif
            _error -> nil
          end

        dominant_color =
          case Image.dominant_color(image) do
            {:ok, color} ->
              to_hex_color(color)

            _error ->
              nil
          end

        {width, height, channels} = Image.shape(image)

        {:ok,
         %{
           dhash: dhash,
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

  @spec process(Enumerable.t(), Keyword.t()) :: {:ok, FileData.t()} | {:error, String.t()}
  def process(%FileData{} = file_data, args) do
    {size_string, vips_args} = parse_args(args)

    with {:ok, image} <- Image.open(FileData.stream!(file_data)),
         {:ok, image} <- Image.thumbnail(image, size_string, vips_args) do
      Image.stream!(image,
        strip_metadata: true,
        minimize_file_size: true,
        suffix: ".webp"
      )
      |> FileData.from_stream("image.webp", mime_type: "image/webp")
    else
      error ->
        error
    end
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
