defmodule Lotta.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  require Logger

  def start(_type, _args) do
    :logger.add_handler(:sentry_handler, Sentry.LoggerHandler, %{})
    :opentelemetry_cowboy.setup()
    OpentelemetryPhoenix.setup(adapter: :cowboy2)
    OpentelemetryAbsinthe.setup()
    OpentelemetryEcto.setup([:lotta, :repo])
    OpentelemetryRedix.setup()

    # List all child processes to be supervised
    children =
      prepended_apps() ++
        [
          {Phoenix.PubSub, name: Lotta.PubSub, adapter: Phoenix.PubSub.PG2},
          LottaWeb.Telemetry,
          Lotta.Repo,
          LottaWeb.Endpoint,
          {Absinthe.Subscription, LottaWeb.Endpoint},
          {Redix, Application.fetch_env!(:lotta, :redis_connection)},
          Lotta.PushNotification,
          {Oban, Application.fetch_env!(:lotta, Oban)},
          {ConCache,
           name: :http_cache, ttl_check_interval: :timer.hours(1), global_ttl: :timer.hours(4)}
        ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    Supervisor.start_link(children, strategy: :one_for_one, name: Lotta.Supervisor)
  end

  defp prepended_apps() do
    topologies = Application.get_env(:libcluster, :topologies)
    Logger.info("Topologies: #{inspect(topologies)}")

    case Application.get_env(:libcluster, :topologies) do
      nil ->
        []

      cluster_topologies ->
        [{Cluster.Supervisor, [cluster_topologies, [name: Lotta.ClusterSupervisor]]}]
    end
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    LottaWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
