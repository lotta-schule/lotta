defmodule Lotta.Storage.FileProcessor.ImageProcessor do
  @moduledoc """
  Module for processing image files.
  """

  alias Lotta.Storage.FileData

  @spec process(FileData.t(), Keyword.t()) :: {:ok, FileData.t()} | {:error, String.t()}
  def process(%FileData{} = file_data, args) do
    {size_string, vips_args} = parse_args(args)

    with {:ok, image} <- Image.open(FileData.stream(file_data)),
         {:ok, image} <- Image.thumbnail(image, size_string, vips_args),
         {:ok, raw_image_data} <-
           Image.write(image, :memory,
             strip_metadata: true,
             minimize_file_size: true,
             suffix: ".webp"
           ) do
      FileData.from_data(raw_image_data, "image.webp", content_type: "image/webp")
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
