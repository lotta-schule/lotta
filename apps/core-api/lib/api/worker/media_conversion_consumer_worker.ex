defmodule Api.MediaConversionConsumerWorker do
  alias Api.Accounts
  require Logger
  use GenServer
  use AMQP

  def start_link(_args) do
    GenServer.start_link(__MODULE__, [], name: :media_conversion_consumer)
  end

  @queue       "media-conversion-results"
  @reconnect_interval   30

  def init(_opts) do
    {:ok, conn} = open_connection()
    {:ok, chan} = Channel.open(conn)
    setup_queue(chan)

    # Register the GenServer process as a consumer
    {:ok, _consumer_tag} = Basic.consume(chan, @queue)
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

  # Confirmation sent by the broker after registering this process as a consumer
  def handle_info({:basic_consume_ok, _content}, chan) do
    {:noreply, chan}
  end

  # Sent by the broker when the consumer is unexpectedly cancelled (such as after a queue deletion)
  def handle_info({:basic_cancel, _content}, chan) do
    {:stop, :normal, chan}
  end

  # Confirmation sent by the broker to the consumer process after a Basic.cancel
  def handle_info({:basic_cancel_ok, _content}, chan) do
    {:noreply, chan}
  end

  def handle_info({:basic_deliver, payload, %{delivery_tag: tag, redelivered: redelivered}}, chan) do
    # You might want to run payload consumption in separate Tasks in production
    consume(chan, tag, redelivered, payload)
    {:noreply, chan}
  end

  def handle_info(:connect, _conn) do
    case open_connection() do
      {:ok, conn} ->
          # Get notifications when the connection goes down
          Process.monitor(conn.pid)
          {:noreply, conn}

      {:error, _} ->
          Logger.error("Failed to connect #{System.get_env("RABBITMQ_URL")}. Reconnecting later...")
          # Retry later
          Process.send_after(self(), :connect, @reconnect_interval)
          {:noreply, nil}
    end
  end

  def handle_info({:DOWN, _, :process, _pid, reason}, _) do
    # Stop GenServer. Will be restarted by Supervisor.
    {:stop, {:connection_lost, reason}, nil}
  end

#    def handle_cast({:publish, message}, channel) do
#     IO.inspect(channel)
#     AMQP.Basic.publish(channel, @exchange, @queue, message, persistent: true)
#     {:noreply, channel}
#   end

  defp setup_queue(chan) do
    # Messages that cannot be delivered to any consumer in the main queue will be routed to the error queue
    {:ok, _} = Queue.declare(chan, @queue, durable: true)
    # :ok = Exchange.fanout(chan, @exchange, durable: true)
    # :ok = Queue.bind(chan, @queue, @exchange)
  end

  defp consume(channel, tag, _redelivered, payload) do
    {:ok, decoded} = Poison.decode(payload)
    IO.inspect(decoded)
    file_id = decoded["parentFileId"]
    outputs = decoded["outputs"]

    for output <- outputs do
      conversion = %{
        :format => output["format"],
        :remote_location => output["remoteLocation"],
        :mime_type => output["mimeType"],
        :file_type => output["fileType"],
        :file_id => file_id
      }
      IO.inspect(Accounts.create_file_conversion(conversion))
    end
    Basic.ack channel, tag

#   rescue
#     # Requeue unless it's a redelivered message.
#     # This means we will retry consuming a message once in case of exception
#     # before we give up and have it moved to the error queue
#     #
#     # You might also want to catch :exit signal in production code.
#     # Make sure you call ack, nack or reject otherwise comsumer will stop
#     # receiving messages.
#     exception ->
#       :ok = Basic.reject channel, tag, requeue: not redelivered
#       IO.puts "Error converting #{payload} to json"
  end

end
