defmodule Lotta.Storage.FileProcessor.VideoProcessor do
  @moduledoc """
  Module for processing video files.
  """

  require Logger

  alias Lotta.Storage.{File, FileData}
  alias Lotta.Storage.Conversion.AvailableFormats
  alias Lotta.Worker.MediaConversion

  @spec read_metadata(FileData.t()) :: {:ok, map()} | {:error, String.t()}
  def read_metadata(%FileData{} = file_data) do
    with %{_path: path} when not is_nil(path) <- file_data,
         {:ok, format_map} <- FFprobe.format(path) do
      {:ok,
       %{
         format: format_map["format_name"],
         duration: format_map["duration"],
         size: format_map["size"],
         bitrate: format_map["bit_rate"],
         streams:
           FFprobe.streams(path)
           |> case do
             {:ok, streams} when is_list(streams) ->
               streams

             error ->
               Logger.warning("Failed to read video streams: #{inspect(error)}")
               nil
           end
       }}
    else
      error ->
        Logger.error("Failed to read video metadata: #{inspect(error)}")
        {:error, "Failed to read video metadata"}
    end
  end

  @spec process_multiple(File.t(), keyword(keyword())) ::
          {:ok, keyword(File.t())} | {:error, String.t()}
  def process_multiple(%File{} = file, formats_args) do
    if process_on_by_one?(file, formats_args) do
      process_separatly(file, formats_args)
    else
      process_together(file, formats_args)
    end
  end

  defp process_on_by_one?(%File{file_type: file_type}, format_args) do
    target_type =
      format_args
      |> List.first()
      |> elem(1)
      |> Keyword.get(:type)

    target_type in [:video, :audio] and
      file_type in [:video, :audio]
  end

  defp process_separatly(file, format_args) do
    format_args
    |> Enum.reduce(%{}, fn {format, _}, acc ->
      MediaConversion.new(%{
        "prefix" => Ecto.get_meta(file, :prefix),
        "file_id" => file.id,
        "format_name" => format
      })
      |> Oban.insert()
      |> case do
        {:ok, job} ->
          job
          |> MediaConversion.await_completion()
          |> then(&Map.put(acc, format, &1))

        {:error, reason} ->
          Logger.error("Failed to create media conversion job: #{inspect(reason)}")
          acc
      end
      |> then(&{:ok, &1})
    end)
  end

  defp process_together(file, formats_args) do
    MediaConversion.new(
      %{
        prefix: Ecto.get_meta(file, :prefix),
        file_id: file.id,
        format_names: Enum.map(formats_args, &elem(&1, 0))
      },
      queue: get_queue(formats_args)
    )
    |> Oban.insert()
    |> case do
      {:ok, job} ->
        MediaConversion.await_completion(job)

      error ->
        Logger.error("Failed to create media conversion job: #{inspect(error)}")
        {:error, "Failed to create media conversion job"}
    end
  end

  defp get_queue(formats_args) do
    if Enum.any?(formats_args, fn {format_name, _args} ->
         AvailableFormats.get_category(format_name) == :preview
       end),
       do: :preview_generation,
       else: :media_conversion
  end
end
