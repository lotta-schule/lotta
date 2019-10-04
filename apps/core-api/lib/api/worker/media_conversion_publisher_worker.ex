defmodule Api.MediaConversionPublisherWorker do
  use GenServer
  use AMQP

  def start_link(_args) do
    GenServer.start_link(__MODULE__, [], name: :media_conversion_publisher)
  end

  @exchange    "media-conversion"
  @queue       "media-conversion-tasks"

  def init(_opts) do
    {:ok, conn} = open_connection()
    {:ok, chan} = Channel.open(conn)
    setup_queue(chan)

    {:ok, chan}
  end

  defp open_connection() do
    config = Application.fetch_env!(:api, :rabbitmq_connection)
    Connection.open(
      username: Keyword.get(config, :username),
      password: Keyword.get(config, :password),
      host: Keyword.get(config, :host)
    )
  end

  def send_conversion_request(file) do
    IO.inspect(file)
    {:ok, encoded_file} = Poison.encode(file)
    publish(encoded_file)
    file
  end

  def publish(message) do
    GenServer.cast(:media_conversion_publisher, {:publish, message})
  end

   def handle_cast({:publish, message}, channel) do
    IO.inspect(channel)
    AMQP.Basic.publish(channel, @exchange, @queue, message, persistent: true)
    {:noreply, channel}
  end

  defp setup_queue(chan) do
    # Messages that cannot be delivered to any consumer in the main queue will be routed to the error queue
    {:ok, _} = Queue.declare(chan, @queue, durable: true)
    :ok = Exchange.fanout(chan, @exchange, durable: true)
    :ok = Queue.bind(chan, @queue, @exchange)
  end

end
