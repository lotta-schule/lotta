defmodule Api.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    redis_config = Application.fetch_env!(:api, :redis_connection)

    # List all child processes to be supervised
    children = [
      # Start the Ecto repository
      Api.Repo,
      # Start the PubSub Server
      {Phoenix.PubSub, name: Api.PubSub},
      ApiWeb.Telemetry,
      # Start the endpoint when the application starts
      ApiWeb.Endpoint,
      # Starts a worker by calling: Api.Worker.start_link(arg)
      Api.Queue.MediaConversionRequestPublisher,
      Api.Queue.MediaConversionConsumer,
      Api.Queue.EmailPublisher,
      {Redix, redis_config},
      Api.Elasticsearch.Cluster,
      {ConCache,
       name: :http_cache, ttl_check_interval: :timer.hours(1), global_ttl: :timer.hours(4)}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Api.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    ApiWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
