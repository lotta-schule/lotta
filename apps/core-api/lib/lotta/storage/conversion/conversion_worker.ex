defmodule Lotta.Storage.Conversion.ConversionWorker do
  @moduledoc """
  Conversion worker that converts a file to a different format.
  """
  use Oban.Worker,
    queue: :file_conversion,
    max_attempts: 5

  import Ecto.Query

  alias Lotta.{Repo, Storage}
  alias Lotta.Storage.{File, FileProcessor}
  alias Lotta.Storage.Conversion.AvailableFormats

  @impl Oban.Worker
  def perform(%{id: job_id, args: %{"prefix" => prefix, "file_id" => file_id, "format" => format}}) do
    with {:ok, format} <- AvailableFormats.to_atom(format),
         file when not is_nil(file) <- Repo.get(File, file_id, prefix: prefix),
         {:ok, file_data} <- File.to_file_data(file),
         {:ok, {_format, processed_file_data}} <- FileProcessor.process_file(file_data, format),
         {:ok, file_conversion} <-
           Storage.create_file_conversion(file, to_string(format), processed_file_data) do
      Oban.Notifier.notify(Oban, :conversion_jobs, %{"complete" => job_id})
      {:ok, file_conversion}
    else
      nil ->
        {:error, "File not found"}

      {:error, error} ->
        Logger.error("Error converting file: #{inspect(error)}")
        {:error, "Error converting file: #{error}"}
    end
  end

  @impl Oban.Worker
  def timeout(_job), do: :timer.minutes(2.5)

  @spec convert_file(File.t(), atom() | String.t()) :: {:ok, Oban.Job.t()} | {:error, String.t()}
  def convert_file(%File{id: file_id} = file, format) when is_atom(format) do
    if AvailableFormats.format_available?(file, format) do
      new(%{file_id: file_id, format: format})
      |> Oban.insert()
    else
      {:error, "Invalid format"}
    end
  end

  def convert_file(file, format), do: convert_file(file, String.to_existing_atom(format))

  @spec get_conversion_job(File.t(), atom() | String.t()) :: Oban.Job.t() | nil
  def get_conversion_job(%{id: file_id} = file, format) do
    format = to_string(format)
    prefix = Ecto.get_meta(file, :prefix)

    Oban
    |> Oban.config()
    |> Oban.Repo.one(
      from(
        j in Oban.Job,
        where:
          fragment("?->>? = ?", j.args, "prefix", ^prefix) and
            fragment("?->>? = ?", j.args, "file_id", ^file_id) and
            fragment("?->>? = ?", j.args, "format", ^format)
      )
    )
  end

  @spec get_or_create_conversion_job(File.t(), atom() | String.t()) ::
          {:ok, Oban.Job.t()} | {:error, String.t()}
  def get_or_create_conversion_job(%{id: _id} = file, format) do
    case get_conversion_job(file, format) do
      %Oban.Job{state: state} = job when state in ["scheduled", "executing"] ->
        {:ok, job}

      %Oban.Job{} ->
        {:error, "Conversion job already completed"}

      nil ->
        new(%{prefix: Ecto.get_meta(file, :prefix), file_id: file.id, format: format})
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
        7500 ->
          {:error, "Conversion job timed out"}
      end
    end)
    |> Task.await(8000)
  end
end
