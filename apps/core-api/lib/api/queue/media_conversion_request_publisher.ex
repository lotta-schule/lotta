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
    GenRMQ.Publisher.publish(Api.Queue.MediaConversionRequestPublisher, encoded_file)
    file
  end

  defp rmq_uri do
    Application.fetch_env!(:api, :rabbitmq_url)
  end
end
