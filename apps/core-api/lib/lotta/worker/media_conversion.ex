defmodule Lotta.Worker.MediaConversion do
  @moduledoc """
  Conversion worker that converts a file to a different format.
  """
  use Oban.Worker,
    queue: :media_conversion,
    max_attempts: 4,
    # 0-9, 0 is highest
    priority: 5,
    unique: [
      period: :infinity,
      timestamp: :scheduled_at,
      states: Oban.Job.states(),
      fields: [:worker, :args]
    ]

  use FFmpex.Options

  import FFmpex

  require Logger

  alias Lotta.{Repo, Storage}
  alias Lotta.Storage.{File, FileData}
  alias Lotta.Worker.Conversion
  alias Lotta.Storage.Conversion.AvailableFormats

  @impl Oban.Worker
  def perform(%{
        id: job_id,
        args: args
      }) do
    case check_args(args) do
      {:ok, file, :format_name, format_name} ->
        process_single_format(
          job_id,
          file,
          format_name
        )

        FileData.clear({:for, file})

        Oban.Notifier.notify(Oban, :media_conversion, %{
          "complete" => job_id
        })

      {:ok, file, :format_names, format_names} ->
        silent_process_multiple(job_id, file, format_names)

        FileData.clear({:for, file})

        Oban.Notifier.notify(Oban, :media_conversion, %{
          "complete" => job_id
        })

      {:error, reason} ->
        Logger.error("Error processing conversion job #{job_id}: #{inspect(reason)}")
        Oban.Notifier.notify(Oban, :media_conversion, %{"error" => job_id})
        {:error, reason}
    end
  end

  @doc """
  Checks the arguments for the conversion job.
  Returns `{:ok, file, format_name, format_names}` if valid,
  or `{:error, reason}` if invalid.
  """
  @doc since: "6.0.0"
  @spec check_args(map()) ::
          {:ok, File.t(), :format_name, String.t()}
          | {:ok, File.t(), :format_names, list(String.t())}
          | {:error, String.t()}
  def check_args(%{"prefix" => prefix, "file_id" => file_id} = args) do
    format_name = args["format_name"]
    format_names = args["format_names"]

    file = Repo.get(File, file_id, prefix: prefix)

    cond do
      is_nil(file) ->
        {:error, "File not found"}

      !format_name and !format_names ->
        {:error,
         "No format specified for conversion. Either 'format_name' or 'format_names' must be provided."}

      not is_nil(format_name) and not is_nil(format_names) ->
        {:error, "Both 'format_name' and 'format_names' provided. Only one should be specified."}

      is_nil(format_name) ->
        {:ok, file, :format_names, format_names}

      true ->
        {:ok, file, :format_name, format_name}
    end
  end

  defp silent_process_multiple(job_id, file, format_names) do
    format_names
    |> Enum.map(fn format_name ->
      case process_single_format(job_id, file, format_name) do
        {:ok, result} ->
          {format_name, result}

        {:error, error} ->
          Logger.error("Error processing format #{format_name}: #{inspect(error)}")
          {}
      end
    end)
    |> Enum.filter(&tuple_size/1)
    |> then(&{:ok, &1})
  end

  defp process_single_format(_job_id, file, format_name) do
    Conversion.report_progress(file, nil)

    with {:ok, format} <- AvailableFormats.to_atom(format_name),
         {:ok, args} <- AvailableFormats.get_format_config(file, format),
         {:ok, file_data} <- File.to_file_data(file),
         {:ok, processed_file_data} <- process(file_data, args),
         {:ok, file_conversion} <-
           Storage.create_file_conversion(processed_file_data, file, format_name) do
      Conversion.report_progress(file, file_conversion)
      {:ok, file_conversion}
    end
  end

  @spec process(FileData.t(), format_args :: Keyword.t()) ::
          {:ok, FileData.t()} | {:error, String.t()}
  defp process(%FileData{_path: path} = file_data, args) do
    FFmpex.new_command()
    |> add_input_file(path)
    |> add_file_option(option_analyzeduration("15M"))
    |> add_file_option(option_probesize("15M"))
    |> add_output_file("pipe:1")
    |> apply_file_args(args)
    |> apply_args(args, file_data)
    |> prepare()
    |> Tuple.to_list()
    |> List.flatten()
    |> tap(fn commandlist ->
      Logger.warning("Running FFmpeg command: #{inspect(commandlist)}")
    end)
    |> Exile.stream!(stderr: :consume)
    |> Stream.map(fn
      {:stdout, data} ->
        data

      {:stderr, msg} ->
        Logger.warning("FFmpeg output: #{msg}")
        nil
    end)
    |> Stream.reject(&is_nil/1)
    |> FileData.from_stream("output.#{get_extension(args)}",
      mime_type: get_mime_type(args)
    )
  end

  defp get_extension(args), do: "#{args[:format]}"

  defp get_mime_type(args), do: Enum.join([args[:type], args[:format]], "/")

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
        frame_count = if args[:content] == :poster, do: 1, else: 30

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
            "setpts=0.05*PTS,framerate=2,#{get_scale_value(resize_symbol, resize_opts)}"

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

  @impl Oban.Worker
  def timeout(_job), do: :timer.hours(4)

  @doc """
  Awaits the completion of a conversion job.
  Returns {:ok, job} if the job completed successfully, or {:error, reason} if the job failed or timed out.
  """
  @spec await_completion_task(Oban.Job.t()) :: {:ok, Oban.Job.t()} | {:error, String.t()}

  def await_completion_task(%Oban.Job{state: "completed"} = job),
    do: Task.async(fn -> {:ok, job} end)

  def await_completion_task(%Oban.Job{id: job_id, state: state} = job)
      when state in ["executable", "available", "scheduled"] do
    Task.async(fn ->
      :ok = Oban.Notifier.listen(Oban, [:media_conversion])

      receive do
        {:notification, :media_conversion, %{"complete" => ^job_id}} ->
          {:ok, job}

        {:notification, :media_conversion, %{"error" => ^job_id}} ->
          {:error, "Conversion job errored"}
      end
    end)
  end

  def await_completion_task(%Oban.Job{state: state}),
    do: Task.async(fn -> {:error, state} end)

  def await_completion(%Oban.Job{} = job),
    do: Task.await(await_completion_task(job), timeout(job))
end
