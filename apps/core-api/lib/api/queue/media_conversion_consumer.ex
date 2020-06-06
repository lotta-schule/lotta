defmodule Api.Queue.MediaConversionConsumer do
  use GenServer
  alias GenRMQ.Message
  alias Api.Accounts
  alias Api.Repo

  require Logger

  @behaviour GenRMQ.Consumer

  @exchange "media-conversion"
  @queue "media-conversion-results"

  def init(arg) do
    {:ok, arg}
  end

  def init do
    create_rmq_resources()

    [
      queue: @queue,
      exchange: {:fanout, @exchange},
      # routing_key: @queue,
      prefetch_count: "10",
      uri: rmq_uri(),
      deadletter: false
    ]
  end

  def handle_message(%Message{} = message) do
    Logger.info("Received message: #{inspect(message)}")
    {:ok, decoded} = Poison.decode(message.payload)
    file_id = decoded["parentFileId"]
    outputs = decoded["outputs"]

    IO.inspect(outputs)

    if outputs do
      for output <- outputs do
        conversion = %{
          :format => output["format"],
          :remote_location => output["remoteLocation"],
          :mime_type => output["mimeType"],
          :file_type => output["fileType"],
          :file_id => file_id
        }

        Accounts.create_file_conversion(conversion)
      end
    end

    ack(message)
  rescue
    exception ->
      Logger.error(Exception.format(:error, exception, System.stacktrace()))
      reject(message, false)
  end

  def start_link(_args) do
    GenRMQ.Consumer.start_link(__MODULE__, name: __MODULE__)
  end

  def ack(%Message{attributes: %{delivery_tag: tag}} = message) do
    Logger.debug("Message successfully processed. Tag: #{tag}")
    GenRMQ.Consumer.ack(message)
  end

  def reject(%Message{attributes: %{delivery_tag: tag}} = message, requeue \\ true) do
    Logger.info("Rejecting message, tag: #{tag}, requeue: #{requeue}")
    GenRMQ.Consumer.reject(message, requeue)
  end

  def consumer_tag() do
    {:ok, hostname} = :inet.gethostname()
    "#{hostname}-media-conversion-consumer"
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
    # AMQP.Exchange.declare(channel, @exchange, :fanout, durable: true)

    # Create queues
    AMQP.Queue.declare(channel, @queue, durable: true)

    # AMQP.Queue.bind(channel, @queue, @exchange, routing_key: @queue)

    # Close the channel as it is no longer needed
    # GenRMQ will manage its own channel
    AMQP.Channel.close(channel)
  end
end
