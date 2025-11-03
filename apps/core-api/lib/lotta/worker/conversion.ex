defmodule Lotta.Worker.Conversion do
  @moduledoc """
  Conversion worker that converts a file to a different format.
  """
  use Oban.Worker,
    queue: :file_conversion,
    max_attempts: 5,
    # 0-9, 0 is highest
    priority: 2,
    unique: [
      period: :infinity,
      timestamp: :scheduled_at,
      states: Oban.Job.states(),
      fields: [:worker, :args]
    ]

  import Ecto.Query
  import Lotta.Storage.Conversion.AvailableFormats, only: [is_valid_category?: 1]

  require Logger

  alias Lotta.Repo
  alias Lotta.Tenants
  alias Lotta.Storage.{File, FileConversion, FileData}
  alias Lotta.Storage.Conversion.AvailableFormats
  alias Lotta.Storage.FileProcessor.{ImageProcessor, VideoProcessor}

  @impl Oban.Worker
  def perform(%{
        id: job_id,
        args: %{"prefix" => prefix, "file_id" => file_id, "format_category" => format_category}
      }) do
    with {:ok, format_category} <-
           AvailableFormats.to_atom(format_category),
         file when not is_nil(file) <- Repo.get(File, file_id, prefix: prefix),
         file <- Repo.preload(file, [:file_conversions]),
         {:ok, file_conversions} <-
           process_file(file, format_category, skip: Enum.map(file.file_conversions, & &1.format)) do
      Oban.Notifier.notify(Oban, :conversion_jobs, %{"complete" => job_id})

      {:ok, file_conversions}
    else
      nil ->
        {:error, "File not found"}

      {:error, error} ->
        Oban.Notifier.notify(Oban, :conversion_jobs, %{"error" => job_id})
        Logger.error("Error converting file: #{inspect(error)}")

        if to_string(error) == "Failed to create image from VipsSource" do
          # File is corrupted or not supported, so we can cancel the job
          {:cancel, to_string(error)}
        else
          {:error, "Error converting file: #{error}"}
        end
    end
  end

  @doc """
  Reads custom metadata from a file.
  """
  @spec read_metadata(FileData.t()) :: {:ok, map()} | {:error, String.t()}
  def read_metadata(%FileData{} = file_data),
    do: get_processor_module(file_data).read_metadata(file_data)

  @doc """
  Processes a file with a given format_category and returns the processed file data.
  Will return the file data, which will still need to be uploaded and persisted to the database.
  """
  @spec process_file(File.t(), format_category :: atom(), options :: keyword() | nil) ::
          {:ok, keyword(FileConversion.t())} | {:error, String.t()}
  def process_file(file, format_category, options \\ [])

  def process_file(file, format_category, options)
      when is_valid_category?(format_category) do
    target_formats =
      AvailableFormats.list(format_category)
      |> Enum.filter(fn {format, _} ->
        not Enum.member?(options[:skip] || [], to_string(format))
      end)
      |> Enum.into([])

    processor = get_processor_module(file)

    cond do
      is_nil(processor) ->
        {:error, "No processor available for file type #{file.file_type}"}

      target_formats == [] ->
        {:ok, []}

      true ->
        processor.process_multiple(file, target_formats)
    end
  end

  def process_file(_, format, _), do: {:error, "Invalid format category #{format}"}

  def get_processor_module(%FileData{metadata: metadata}),
    do: get_processor_module_for_filetype(metadata[:type])

  def get_processor_module(%File{file_type: file_type}),
    do: get_processor_module_for_filetype(file_type)

  def get_processor_module(%Oban.Job{args: %{"prefix" => prefix, "file_id" => file_id}}) do
    if file = Repo.get(File, file_id, prefix: prefix),
      do: get_processor_module(file),
      else: ImageProcessor
  end

  def get_processor_module_for_filetype("video"), do: VideoProcessor
  def get_processor_module_for_filetype("audio"), do: VideoProcessor
  def get_processor_module_for_filetype("image"), do: ImageProcessor
  def get_processor_module_for_filetype(_), do: ImageProcessor

  def report_progress(file, file_conversion) do
    tenant_prefix = Ecto.get_meta(file, :prefix)
    tenant = Tenants.get_tenant_by_prefix(tenant_prefix)
    channel_name = "#{tenant.id}:files:#{file.id}:conversion"

    Absinthe.Subscription.publish(
      LottaWeb.Endpoint,
      %{
        file: file,
        file_conversion: file_conversion
      },
      conversion_progress: channel_name
    )
  rescue
    e ->
      Logger.error("Failed to publish conversion progress: #{inspect(e)}")
      :error
  end

  @impl Oban.Worker
  def timeout(job) do
    case get_processor_module(job) do
      VideoProcessor -> :timer.hours(4)
      _ -> :timer.minutes(15)
    end
  end

  @spec get_current_jobs(File.t()) :: Oban.Job.t() | nil
  def get_current_jobs(%{id: file_id} = file) do
    prefix = Ecto.get_meta(file, :prefix)

    Oban
    |> Oban.config()
    |> Oban.Repo.all(
      from(
        j in Oban.Job,
        where:
          j.worker == ^Oban.Worker.to_string(__MODULE__) and
            j.state not in ["completed", "cancelled"] and
            fragment("?->>? = ?", j.args, "prefix", ^prefix) and
            fragment("?->>? = ?", j.args, "file_id", ^file_id)
      )
    )
  end

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

  @spec get_or_create_conversion_job(
          File.t(),
          atom() | String.t(),
          opts :: [create: :easy_format]
        ) ::
          {:ok, Oban.Job.t()} | {:error, String.t()}
  def get_or_create_conversion_job(%{id: _id} = file, format, opts \\ []) do
    case get_conversion_job(file, format) do
      %Oban.Job{state: state} = job
      when state in ["available", "scheduled", "executing", "completed"] ->
        {:ok, job}

      %Oban.Job{state: state} ->
        {:error, "Conversion job state is: #{state}"}

      nil ->
        case Keyword.get(opts, :create) == :easy_format and
               AvailableFormats.validate_easy_format(file, format) do
          false ->
            create_conversion_job(file, format)

          {:ok, _} ->
            # If the format is valid and creation is allowed, create the job
            create_conversion_job(file, format)

          error ->
            error
        end
    end
  end

  @spec create_conversion_job(File.t(), atom() | String.t()) ::
          {:ok, Oban.Job.t()} | {:error, String.t()}
  defp create_conversion_job(file, format) do
    category_name = AvailableFormats.get_category(format)

    if AvailableFormats.is_valid_category?(category_name) do
      %{
        "prefix" => Ecto.get_meta(file, :prefix),
        "file_id" => file.id,
        "format_category" => category_name
      }
      |> __MODULE__.new()
      |> Oban.insert()
    else
      {:error, "Invalid format: #{format} is not a valid category name."}
    end
  end

  @doc """
  Awaits the completion of a conversion job.
  Returns {:ok, job} if the job completed successfully, or {:error, reason} if the job failed or timed out.
  """
  @spec await_completion_task(Oban.Job.t()) :: {:ok, Oban.Job.t()} | {:error, String.t()}

  def await_completion_task(%Oban.Job{state: "completed"} = job),
    do: Task.async(fn -> {:ok, job} end)

  def await_completion_task(%Oban.Job{id: job_id, state: state} = job)
      when state in ["executing", "available", "scheduled", "retryable"] do
    Task.async(fn ->
      :ok = Oban.Notifier.listen(Oban, [:conversion_jobs])

      receive do
        {:notification, :conversion_jobs, %{"complete" => ^job_id}} ->
          {:ok, job}

        {:notification, :conversion_jobs, %{"error" => ^job_id}} ->
          {:error, "Conversion job errored"}
      after
        timeout(job) ->
          {:error, "Conversion job timed out"}
      end
    end)
  end

  def await_completion_task(%Oban.Job{state: state}),
    do: Task.async(fn -> {:error, state} end)

  def await_completion(%Oban.Job{} = job) do
    Task.await(
      await_completion_task(job),
      timeout(job)
    )
  end
end
