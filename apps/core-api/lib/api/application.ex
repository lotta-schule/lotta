defmodule Api.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    environment = Application.fetch_env!(:api, :environment)

    # List all child processes to be supervised
    children =
      cond do
        environment == :production ->
          service_name = System.get_env("SERVICE_NAME")
          app_name = System.get_env("APP_NAME")

          # libcluster setting
          topologies = [
            k8s: [
              strategy: Elixir.Cluster.Strategy.Kubernetes.DNS,
              config: [
                service: service_name,
                application_name: app_name,
                polling_interval: 5000
              ]
            ]
          ]

          [{Cluster.Supervisor, [topologies, [name: Api.ClusterSupervisor]]}]

        true ->
          []
      end ++
        [
          ApiWeb.Telemetry,
          {Phoenix.PubSub, name: Api.PubSub, adapter: Phoenix.PubSub.PG2},
          Api.Repo,
          ApiWeb.Endpoint,
          {Absinthe.Subscription, ApiWeb.Endpoint},
          {Redix, Application.fetch_env!(:api, :redis_connection)},
          Api.Elasticsearch.Cluster,
          Api.Queue.MediaConversionRequestPublisher,
          Api.Queue.MediaConversionConsumer,
          {ConCache,
           name: :http_cache, ttl_check_interval: :timer.hours(1), global_ttl: :timer.hours(4)}
        ] ++
        cond do
          environment == :development ->
            []

          environment == :production ->
            [Api.System.DefaultContent]

          environment == :test ->
            []

          true ->
            []
        end

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
