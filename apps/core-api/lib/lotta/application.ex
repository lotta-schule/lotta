defmodule Lotta.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    environment = Application.fetch_env!(:lotta, :environment)

    # List all child processes to be supervised
    children =
      prepanded_apps(environment) ++
        [
          LottaWeb.Telemetry,
          {Phoenix.PubSub, name: Lotta.PubSub, adapter: Phoenix.PubSub.PG2},
          Lotta.Repo,
          LottaWeb.Endpoint,
          {Absinthe.Subscription, LottaWeb.Endpoint},
          {Lotta.TenantCacheServer, name: Lotta.TenantCacheServer},
          {Redix, Application.fetch_env!(:lotta, :redis_connection)},
          Lotta.Elasticsearch.Cluster,
          Lotta.Queue.MediaConversionRequestPublisher,
          Lotta.Queue.MediaConversionConsumer,
          {ConCache,
           name: :http_cache, ttl_check_interval: :timer.hours(1), global_ttl: :timer.hours(4)}
        ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    Supervisor.start_link(children, strategy: :one_for_one, name: Lotta.Supervisor)
  end

  defp prepanded_apps(:production) do
    # libcluster setting
    topologies = [
      k8s: [
        strategy: Elixir.Cluster.Strategy.Kubernetes.DNS,
        config: [
          service: System.get_env("SERVICE_NAME"),
          application_name: System.get_env("APP_NAME"),
          polling_interval: 5000
        ]
      ]
    ]

    [{Cluster.Supervisor, [topologies, [name: Lotta.ClusterSupervisor]]}]
  end

  defp prepanded_apps(_), do: []

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    LottaWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
