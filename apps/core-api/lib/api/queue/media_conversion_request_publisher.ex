defmodule Api.Queue.MediaConversionRequestPublisher do
  @moduledoc """
    Outgoing queue for dispatching uploaded files, in order for them to have the possibility to be processed
  """

  use GenServer
  @behaviour GenRMQ.Publisher
  alias Api.Accounts.File

  require Logger

  @exchange "media-conversion"
  @queue "media-conversion-tasks"

  def init(_args \\ []) do
    create_rmq_resources()

    [
      queue: @queue,
      exchange: {:direct, @exchange},
      connection: rmq_uri()
    ]
  end

  def start_link(_args) do
    GenRMQ.Publisher.start_link(__MODULE__, name: __MODULE__)
  end

  def send_conversion_request(%File{} = file) do
    {:ok, encoded_file} = Poison.encode(file)
    GenRMQ.Publisher.publish(Api.Queue.MediaConversionRequestPublisher, encoded_file, @queue)
    file
  end

  defp rmq_uri do
    Application.fetch_env!(:api, :rabbitmq_url)
  end

  defp create_rmq_resources do
    {:ok, connection} = AMQP.Connection.open(rmq_uri())
    {:ok, channel} = AMQP.Channel.open(connection)

    AMQP.Queue.declare(channel, @queue, durable: true)
    GenRMQ.Binding.bind_exchange_and_queue(channel, {:direct, @exchange}, @queue, @queue)

    AMQP.Channel.close(channel)
  end
end
