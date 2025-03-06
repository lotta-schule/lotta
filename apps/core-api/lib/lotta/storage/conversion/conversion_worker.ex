defmodule Lotta.Storage.Conversion.ConversionWorker do
  @moduledoc """
  Conversion worker that converts a file to a different format.
  """
  use Oban.Worker,
    queue: :file_conversion,
    max_attempts: 5,
    # 0-9, 0 is highest
    priority: 1,
    unique: [
      period: :timer.hours(24),
      timestamp: :scheduled_at,
      states: Oban.Job.states(),
      fields: [:worker, :args]
    ]

  import Ecto.Query

  require Logger

  alias Lotta.{Repo, Storage}
  alias Lotta.Storage.{File, FileProcessor}
  alias Lotta.Storage.Conversion.AvailableFormats

  @impl Oban.Worker
  def perform(%{
        id: job_id,
        args: %{"prefix" => prefix, "file_id" => file_id, "format_category" => format_category}
      }) do
    with {:ok, format_category} <- AvailableFormats.to_atom(format_category),
         file when not is_nil(file) <- Repo.get(File, file_id, prefix: prefix),
         {:ok, file_data} <- File.to_file_data(file),
         {:ok, results} <-
           FileProcessor.process_file(file_data, format_category) do
      file_conversions =
        for({format, processed_file_data} <- results) do
          Storage.create_file_conversion(file, to_string(format), processed_file_data)
        end

      Oban.Notifier.notify(Oban, :conversion_jobs, %{"complete" => job_id})
      {:ok, file_conversions}
    else
      nil ->
        {:error, "File not found"}

      {:error, error} ->
        Logger.error("Error converting file: #{inspect(error)}")
        {:error, "Error converting file: #{error}"}
    end
  end

  @impl Oban.Worker
  def timeout(_job), do: :timer.minutes(2)

  @spec get_conversion_job(File.t(), atom() | String.t()) :: Oban.Job.t() | nil
  def get_conversion_job(%{id: file_id} = file, format) do
    format_category = to_string(AvailableFormats.get_category(format))
    prefix = Ecto.get_meta(file, :prefix)

    Oban
    |> Oban.config()
    |> Oban.Repo.one(
      from(
        j in Oban.Job,
        where:
          fragment("?->>? = ?", j.args, "prefix", ^prefix) and
            fragment("?->>? = ?", j.args, "file_id", ^file_id) and
            fragment("?->>? = ?", j.args, "format_category", ^format_category)
      )
    )
  end

  @spec get_or_create_conversion_job(File.t(), atom() | String.t()) ::
          {:ok, Oban.Job.t()} | {:error, String.t()}
  def get_or_create_conversion_job(%{id: _id} = file, format) do
    case get_conversion_job(file, format) do
      %Oban.Job{state: state} = job when state in ["scheduled", "executing"] ->
        {:ok, job}

      %Oban.Job{state: state} ->
        {:error, "Conversion job state is: #{state}"}

      nil ->
        new(%{
          prefix: Ecto.get_meta(file, :prefix),
          file_id: file.id,
          format_category: AvailableFormats.get_category(format)
        })
        |> Oban.insert()
    end
  end

  @spec await_conversion(Oban.Job.t()) :: {:ok, Oban.Job.t()} | {:error, String.t()}
  def await_conversion(%Oban.Job{id: job_id} = job) do
    Task.async(fn ->
      :ok = Oban.Notifier.listen(Oban, [:conversion_jobs])

      receive do
        {:notification, :conversion_jobs, %{"complete" => ^job_id}} ->
          {:ok, job}
      after
        25_000 ->
          {:error, "Conversion job timed out"}
      end
    end)
    |> Task.await(30_000)
  end
end
