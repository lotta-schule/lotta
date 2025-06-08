defmodule Lotta.Storage.FileProcessor.VideoProcessor do
  @moduledoc """
  Module for processing video files.
  """

  require Logger

  alias Lotta.Storage.FileData
  import FFmpex
  use FFmpex.Options

  @spec read_metadata(FileData.t()) :: {:ok, map()} | {:error, String.t()}
  def read_metadata(%FileData{} = file_data) do
    with path when not is_nil(path) <- file_data._path,
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

  @spec process(FileData.t(), {format_name :: String.t(), format_args :: Keyword.t()}) ::
          {:ok, FileData.t()} | {:error, String.t()}
  def process(%FileData{_path: path} = file_data, args) do
    FFmpex.new_command()
    |> add_input_file(path)
    |> add_output_file("pipe:1")
    |> apply_file_args(args)
    |> apply_args(args, file_data)
    |> prepare()
    |> Tuple.to_list()
    |> List.flatten()
    |> tap(fn commandlist ->
      Logger.info("Running FFmpeg command: #{inspect(commandlist)}")
    end)
    |> Exile.stream!(
      input: FileData.stream!(file_data, 65_535),
      stderr: :consume,
      max_chunk_size: 8 * 1024 * 1024
    )
    |> Stream.map(fn
      {:stdout, data} ->
        data

      {:stderr, msg} ->
        Logger.warning("FFmpeg output: #{msg}")
        nil
    end)
  end

  @spec process_multiple(FileData.t(), keyword(keyword())) ::
          {:ok, keyword(FileData.t())} | {:error, String.t()}
  def process_multiple(%FileData{} = file_data, formats_args) do
    formats_args
    |> Enum.map(fn {format, args} ->
      file_extension = args[:format]

      process(file_data, args)
      |> Stream.reject(&is_nil/1)
      |> FileData.from_stream("output.#{file_extension}",
        mime_type: "#{String.downcase(to_string(args[:type]))}/#{file_extension}"
      )
      |> case do
        {:ok, file_data} ->
          {format, file_data}

        {:error, reason} ->
          Logger.error("Failed to process video: #{reason}")
          nil
      end
    end)
    |> Enum.reject(&is_nil/1)
    |> then(&{:ok, &1})
  end

  defp apply_args(command, args, input_file) do
    input_type =
      input_file.metadata[:type]
      |> String.to_existing_atom()

    output_type = args[:type]

    case {input_type, output_type} do
      {:video, :video} ->
        command
        |> apply_video_args(args)
        |> apply_audio_args(args)

      {:video, :image} ->
        frame_count = if args[:content] == :poster, do: 1, else: 90

        command
        |> apply_video_args(args)
        |> add_stream_option(option_frames(frame_count))

      {:audio, :image} ->
        width = get_in(args, [:resize, :width]) || get_in(args, [:contain, :width]) || 640
        height = get_in(args, [:resize, :height]) || trunc(width * 9 / 16)
        colors = "#ffffff"

        command
        |> add_global_option(
          option_filter_complex("compand,showwavespic=s=#{width}x#{height}:colors=#{colors}")
        )
        |> add_stream_specifier(stream_type: :video)
        |> add_stream_option(option_frames(1))

      {:audio, :audio} ->
        command
        |> apply_audio_args(args)
    end
  end

  defp apply_file_args(command, args) do
    args
    |> Enum.reduce(command, fn
      {:format, format}, cmd when format in [:mp4] ->
        cmd
        |> add_file_option(option_movflags("frag_keyframe"))
        |> add_file_option(option_f(format))

      {:format, :aac}, cmd ->
        cmd
        |> add_file_option(option_f(:adts))

      {:format, format}, cmd ->
        cmd
        |> add_file_option(option_f(format))

      _, cmd ->
        cmd
    end)
  end

  defp apply_video_args(command, args) do
    args
    |> Enum.reduce(add_stream_specifier(command, stream_type: :video), fn
      {:format, :webm}, cmd ->
        add_stream_option(cmd, option_vcodec("libvpx-vp9"))

      {:format, :mp4}, cmd ->
        cmd
        |> add_stream_option(option_vcodec("libx264"))
        |> add_stream_option(option_pix_fmt("yuv420p"))

      {resize_symbol, resize_opts}, cmd when resize_symbol in [:contain, :resize] ->
        case {args[:type], args[:content]} do
          {:image, :poster} ->
            "thumbnail=50,#{get_scale_value(resize_symbol, resize_opts)}"

          {:image, _} ->
            "setpts=0.05*PTS,framerate=3,#{get_scale_value(resize_symbol, resize_opts)}"

          {_, _} ->
            get_scale_value(resize_symbol, resize_opts)
        end
        |> option_vf()
        |> then(&add_stream_option(cmd, &1))

      {:preset, value}, cmd ->
        add_stream_option(cmd, option_preset(to_string(value)))

      {:video_bitrate, value}, cmd ->
        add_stream_option(cmd, option_b(value))

      {:crf, value}, cmd ->
        add_stream_option(cmd, option_crf(to_string(value)))

      _, cmd ->
        cmd
    end)
  end

  defp get_scale_value(:resize, resize_opts) do
    height = resize_opts[:height] || -1
    width = resize_opts[:width] || -1
    "scale=#{width}:#{height}"
  end

  defp get_scale_value(:contain, resize_opts) do
    height = resize_opts[:height]
    width = resize_opts[:width]
    "scale=w=#{width}:h=#{height}:force_original_aspect_ratio=decrease"
  end

  defp apply_audio_args(command, args) do
    args
    |> Enum.reduce(add_stream_specifier(command, stream_type: :audio), fn
      {:format, :webm}, cmd ->
        add_stream_option(cmd, option_acodec("libopus"))

      {:format, :ogg}, cmd ->
        add_stream_option(cmd, option_acodec("libopus"))

      {:format, :aac}, cmd ->
        add_stream_option(cmd, option_acodec("aac"))

      {:audio_bitrate, value}, cmd ->
        add_stream_option(cmd, option_b(value))

      _, cmd ->
        cmd
    end)
  end
end
