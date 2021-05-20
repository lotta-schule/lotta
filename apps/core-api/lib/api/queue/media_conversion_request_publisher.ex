defmodule Api.Queue.MediaConversionRequestPublisher do
  @moduledoc """
    Outgoing queue for dispatching uploaded files, in order for them to have the possibility to be processed
  """

  use GenServer

  require Logger

  alias Api.Storage
  alias Api.Storage.File

  @behaviour GenRMQ.Publisher

  @exchange "media-conversion"
  @queue "media-conversion-tasks"

  def init(_args \\ []) do
    create_rmq_resources()

    [
      queue: @queue,
      exchange: {:direct, prefixed(@exchange)},
      connection: rmq_uri()
    ]
  end

  def start_link(_args) do
    GenRMQ.Publisher.start_link(__MODULE__, name: __MODULE__)
  end

  def send_conversion_request(%File{} = file) do
    {:ok, encoded_file} =
      file
      |> Map.put(:remote_location, Storage.get_http_url(file))
      |> Poison.encode()

    GenRMQ.Publisher.publish(
      Api.Queue.MediaConversionRequestPublisher,
      encoded_file,
      prefix()
    )

    file
  end

  defp rmq_uri do
    Keyword.fetch!(Application.fetch_env!(:api, :rabbitmq), :url)
  end

  defp prefix do
    Keyword.get(Application.fetch_env!(:api, :rabbitmq), :prefix)
  end

  defp prefixed(name) do
    case prefix() do
      nil -> name
      prefix -> "#{prefix}_#{name}"
    end
  end

  defp create_rmq_resources do
    {:ok, connection} = AMQP.Connection.open(rmq_uri())
    {:ok, channel} = AMQP.Channel.open(connection)

    AMQP.Queue.declare(channel, @queue, durable: true)

    GenRMQ.Binding.bind_exchange_and_queue(
      channel,
      {:direct, prefixed(@exchange)},
      @queue,
      prefix()
    )

    AMQP.Channel.close(channel)
  end
end
