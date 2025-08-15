require Protocol
Protocol.derive(Jason.Encoder, Image.Exif.Gps)

defmodule Lotta.Worker.Metadata do
  @moduledoc """
  Worker for fetching a files metadata.
  """
  use Oban.Worker,
    queue: :file_metadata,
    max_attempts: 2,
    # 0-9, 0 is highest
    priority: 1,
    unique: [
      period: :infinity,
      timestamp: :scheduled_at,
      states: Oban.Job.states(),
      fields: [:worker, :args]
    ]

  require Logger

  alias Lotta.Repo
  alias Lotta.Storage.{File, FileData}
  alias Lotta.Storage.FileProcessor.{ImageProcessor, VideoProcessor}

  @impl Oban.Worker
  def perform(%{
        id: job_id,
        args: %{"prefix" => prefix, "file_id" => file_id}
      }) do
    with file when is_struct(file) <-
           Repo.get(File, file_id, prefix: prefix) || {:error, "File not found"},
         {:ok, file_data} <- File.to_file_data(file),
         {:ok, results} <- read_metadata(file_data, file.file_type),
         {:ok, file} <-
           file
           |> Ecto.Changeset.change(metadata: sanitize_values(results))
           |> Ecto.Changeset.put_change(
             :media_duration,
             case Float.parse(Map.get(results, :duration, "")) do
               {duration, _} -> duration
               :error -> nil
             end
           )
           |> Ecto.Changeset.put_change(:page_count, results[:pages])
           |> Repo.update() do
      Oban.Notifier.notify(Oban, :metadata_jobs, %{"complete" => job_id})
      {:ok, file}
    else
      {:error, reason} = error ->
        if String.contains?(inspect(reason), "Unsupported file type") do
          {:cancel, reason}
        else
          Oban.Notifier.notify(Oban, :metadata_jobs, %{"error" => job_id})
          Logger.error("Error updating file metadata: #{inspect(reason)}")
          error
        end
    end
  end

  defp read_metadata(%FileData{} = file_data, "video"),
    do: VideoProcessor.read_metadata(file_data)

  defp read_metadata(%FileData{} = file_data, "audio"),
    do: VideoProcessor.read_metadata(file_data)

  defp read_metadata(%FileData{} = file_data, "image"),
    do: ImageProcessor.read_metadata(file_data)

  defp read_metadata(%FileData{} = file_data, "pdf"),
    do: ImageProcessor.read_metadata(file_data)

  defp read_metadata(_, _filetype),
    do: {:ok, %{}}

  def sanitize_values(%NaiveDateTime{} = value), do: NaiveDateTime.to_iso8601(value)
  def sanitize_values(%DateTime{} = value), do: DateTime.to_iso8601(value)
  def sanitize_values(struct) when is_struct(struct), do: struct

  def sanitize_values(map) when is_map(map),
    do:
      map
      |> Map.new(fn {k, v} -> {k, sanitize_values(v)} end)

  def sanitize_values(list) when is_list(list), do: Enum.map(list, &sanitize_values/1)

  def sanitize_values(value) when is_binary(value) do
    if String.contains?(value, "\u0000") do
      value
      |> to_charlist()
      |> Enum.map(&Integer.to_string/1)
    else
      String.replace_invalid(value)
    end
  end

  def sanitize_values(value), do: value

  @impl Oban.Worker
  def timeout(_job), do: :timer.seconds(30)

  @spec create_metadata_job(File.t()) ::
          {:ok, Oban.Job.t()} | {:error, String.t()}
  def create_metadata_job(%{id: _id} = file) do
    %{
      "prefix" => Ecto.get_meta(file, :prefix),
      "file_id" => file.id
    }
    |> __MODULE__.new()
    |> Oban.insert()
  end

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
      :ok = Oban.Notifier.listen(Oban, [:metadata_jobs])

      receive do
        {:notification, :metadata_jobs, %{"complete" => ^job_id}} ->
          {:ok, job}

        {:notification, :metadata_jobs, %{"error" => ^job_id}} ->
          {:error, "Metadata job errored"}
      after
        :timer.seconds(30) ->
          {:error, :timeout}
      end
    end)
  end

  def await_completion_task(%Oban.Job{state: state}),
    do: Task.async(fn -> {:error, state} end)

  def await_completion(%Oban.Job{} = job),
    do: Task.await(await_completion_task(job), :timer.seconds(30))
end
