defmodule Api.Queue.MediaConversionRequestPublisher do
  use GenServer
  @behaviour GenRMQ.Publisher
  alias Api.Accounts.File

  require Logger

  @exchange "media-conversion"
  @queue "media-conversion-tasks"

  def init(arg) do
    {:ok, arg}
  end

  def init do
    create_rmq_resources()

    [
      uri: rmq_uri(),
      exchange: {:fanout, @exchange},
      queue: @queue
    ]
  end

  def start_link(_args) do
    GenRMQ.Publisher.start_link(__MODULE__, name: __MODULE__)
  end

  def send_conversion_request(%File{} = file) do
    {:ok, encoded_file} = Poison.encode(file)
    GenRMQ.Publisher.publish(Api.Queue.MediaConversionRequestPublisher, encoded_file)
    file
  end

  defp rmq_uri do
    config = Application.fetch_env!(:api, :rabbitmq_connection)
    username = Keyword.get(config, :username)
    password = Keyword.get(config, :password)
    host = Keyword.get(config, :host)

    "amqp://#{username}:#{password}@#{host}"
  end

  defp create_rmq_resources do
    # Setup RabbitMQ connection
    {:ok, connection} = AMQP.Connection.open(rmq_uri())
    {:ok, channel} = AMQP.Channel.open(connection)

    # Create exchange
    AMQP.Exchange.declare(channel, @exchange, :fanout, durable: true)

    # Create queues
    AMQP.Queue.declare(channel, @queue, durable: true)

    AMQP.Queue.bind(channel, @queue, @exchange, routing_key: @queue)

    # Close the channel as it is no longer needed
    # GenRMQ will manage its own channel
    AMQP.Channel.close(channel)
  end
end
