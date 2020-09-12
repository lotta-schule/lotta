defmodule Api.Queue.MediaConversionConsumer do
  @moduledoc """
  Incoming Queue for processing media conversions
  """

  require Logger

  alias GenRMQ.Message
  alias Ecto.Changeset
  alias Api.Repo
  alias Api.Accounts.{File, FileConversion}

  use GenServer

  @behaviour GenRMQ.Consumer

  @exchange "media-conversion"
  @queue "media-conversion-results"

  def init(_args \\ []) do
    [
      queue: prefixed(@queue),
      exchange: {:direct, prefixed(@exchange)},
      routing_key: prefix,
      prefetch_count: "10",
      connection: rmq_uri()
    ]
  end

  def handle_message(%Message{} = message) do
    Logger.info("Received message: #{inspect(message)}")
    {:ok, decoded} = Poison.decode(message.payload)
    file_id = decoded["parentFileId"]
    outputs = decoded["outputs"]

    if decoded["processingDuration"] do
      Logger.info("It took the job #{decoded["processingDuration"]}s to complete")
    end

    Logger.info("MediaConversionConsumer received incoming message")
    Logger.info(inspect(outputs))

    with file_id when not is_nil(file_id) <- file_id,
         %{"metadata" => _source_metadata} <- decoded,
         file when not is_nil(file) <- Repo.get(File, file_id),
         {:ok, file} <- Repo.update(add_metadata(file, decoded)) do
      Logger.info("added source metadata to file #{file.id}")
    else
      {:error, %Changeset{} = changeset} ->
        Logger.error("Could not insert metadata to file: #{inspect(changeset)}")

      nil ->
        Logger.error("Could not find the File with the given id #{file_id}")

      _ ->
        nil
    end

    if outputs do
      for output <- outputs do
        %FileConversion{
          :format => output["format"],
          :remote_location => output["remoteLocation"],
          :mime_type => output["mimeType"],
          :file_type => output["fileType"],
          :file_id => file_id
        }
        |> add_metadata(output)
        |> Repo.insert()
        |> case do
          {:ok, conversion} ->
            Logger.info("file conversion #{inspect(conversion)} has been created")

          {:error, reason} ->
            Logger.error("Could not save file conversion to database, error occured: #{reason}")
            reject(message, false)
        end
      end
    end

    ack(message)
  end

  def start_link(_args) do
    GenRMQ.Consumer.start_link(__MODULE__, name: __MODULE__)
  end

  def ack(%Message{attributes: %{delivery_tag: tag}} = message) do
    Logger.debug("Message successfully processed. Tag: #{tag}")
    GenRMQ.Consumer.ack(message)
  end

  def handle_error(message, reason) do
    Logger.warn("#{inspect(reason)} - Failed to process message: #{inspect(message)}")

    reject(message)
  end

  def reject(%Message{attributes: %{delivery_tag: tag}} = message, requeue \\ true) do
    Logger.info("Rejecting message, tag: #{tag}, requeue: #{requeue}")
    GenRMQ.Consumer.reject(message, requeue)
  end

  def consumer_tag() do
    {:ok, hostname} = :inet.gethostname()
    "#{hostname}-media-conversion-consumer"
  end

  defp add_metadata(file_or_conversion, metadata_map)
       when is_map(metadata_map) and is_map_key(metadata_map, "metadata") do
    media_duration =
      get_in(metadata_map, ["metadata", "format", "duration"])
      |> Float.parse()
      |> case do
        {float, _other} ->
          float

        :error ->
          nil
      end

    file_or_conversion
    |> Map.put_new(:filesize, get_in(metadata_map, ["metadata", "format", "size"]))
    |> Changeset.change(%{
      :full_metadata => metadata_map["metadata"],
      :metadata => get_in(metadata_map, ["metadata", "format"]),
      :media_duration => media_duration
    })
  end

  defp add_metadata(file_or_conversion, _), do: file_or_conversion

  defp rmq_uri do
    Keyword.fetch!(Application.fetch_env!(:api, :rabbitmq), :url)
  end

  defp prefix do
    Keyword.get(Application.fetch_env!(:api, :rabbitmq), :prefix)
  end

  defp prefixed(name) do
    case prefix() do
      nil -> name
      prefix -> "#{prefix()}_#{name}"
    end
  end
end
