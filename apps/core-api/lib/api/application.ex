defmodule Api.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    redis_config = Application.fetch_env!(:api, :redis_connection)

    # List all child processes to be supervised
    children = [
      Api.Repo,
      ApiWeb.Telemetry,
      {Phoenix.PubSub, name: Api.PubSub, adapter: Phoenix.PubSub.PG2},
      ApiWeb.Endpoint,
      {Absinthe.Subscription, ApiWeb.Endpoint},
      {Redix, redis_config},
      Api.Elasticsearch.Cluster,
      Api.Queue.MediaConversionRequestPublisher,
      Api.Queue.MediaConversionConsumer,
      {ConCache,
       name: :http_cache, ttl_check_interval: :timer.hours(1), global_ttl: :timer.hours(4)},
      Api.System.DefaultContent
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    Supervisor.start_link(children, strategy: :one_for_one, name: Api.Supervisor)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    ApiWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
