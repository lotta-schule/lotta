defmodule Lotta.Queue.MediaConversionRequestPublisher do
  @moduledoc """
    Outgoing queue for dispatching uploaded files, in order for them to have the possibility to be processed
  """

  use GenServer

  require Logger

  alias Lotta.Storage
  alias Lotta.Storage.File

  @behaviour GenRMQ.Publisher

  @exchange "media-conversion"
  @queue "media-conversion-tasks"

  def init(_args \\ []) do
    create_rmq_resources()

    [
      queue: @queue,
      exchange: {:direct, @exchange},
      connection: rmq_uri()
    ]
    |> IO.inspect()
  end

  def start_link(_args) do
    GenRMQ.Publisher.start_link(__MODULE__, name: __MODULE__)
  end

  def send_conversion_request(%File{} = file) do
    prefix = Ecto.get_meta(file, :prefix)

    {:ok, encoded_file} =
      file
      |> Map.put(:remote_location, Storage.get_http_url(file))
      |> Poison.encode()

    GenRMQ.Publisher.publish(
      Lotta.Queue.MediaConversionRequestPublisher,
      encoded_file,
      @queue,
      prefix: prefix
    )

    file
  end

  defp rmq_uri do
    Keyword.fetch!(Application.fetch_env!(:lotta, :rabbitmq), :url)
  end

  defp create_rmq_resources do
    with {:ok, connection} <- AMQP.Connection.open(rmq_uri()),
         {:ok, channel} <- AMQP.Channel.open(connection) do
      AMQP.Queue.declare(channel, @queue, durable: true)

      GenRMQ.Binding.bind_exchange_and_queue(
        channel,
        {:direct, @exchange},
        @queue,
        @queue
      )

      AMQP.Channel.close(channel)
    else
      error ->
        IO.inspect(error)
    end
  end
end
