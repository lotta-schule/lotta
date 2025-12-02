defmodule Lotta.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  require Logger

  def start(_type, _args) do
    # Create cache dir for file processor
    Lotta.Storage.FileData.create_cache_dir()

    setup_telemetry()
    Logger.add_handlers(:lotta)

    Oban.Telemetry.attach_default_logger()

    # List all child processes to be supervised
    children =
      [
        get_libcluster_app_child(),
        {Task.Supervisor, name: Lotta.TaskSupervisor},
        {Finch, name: Lotta.Finch},
        LottaWeb.Telemetry,
        Lotta.Repo,
        {Phoenix.PubSub, name: Lotta.PubSub, adapter: Phoenix.PubSub.PG2},
        LottaWeb.Endpoint,
        Lotta.PushNotification,
        {Absinthe.Subscription, LottaWeb.Endpoint},
        {Redix, Application.fetch_env!(:lotta, :redis_connection)},
        {ConCache,
         name: :http_cache, ttl_check_interval: :timer.hours(1), global_ttl: :timer.hours(4)},
        {Lotta.Eduplaces.Syncer, Application.get_env(:lotta, Lotta.Eduplaces.Syncer, [])},
        {Oban, Application.fetch_env!(:lotta, Oban)},
        CockpitWeb.Endpoint,
        get_chromic_app_child(),
        get_tcp_healthcheck_app_child()
      ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    children
    |> Enum.filter(&(not is_nil(&1)))
    |> Supervisor.start_link(
      strategy: :one_for_one,
      name: Lotta.Supervisor
    )
  end

  defp setup_telemetry() do
    OpentelemetryOban.setup()
    OpentelemetryBandit.setup()
    OpentelemetryPhoenix.setup(adapter: :bandit)
    OpentelemetryAbsinthe.setup()
    OpentelemetryEcto.setup([:lotta, :repo])
  end

  defp get_libcluster_app_child() do
    with cluster_topologies when not is_nil(cluster_topologies) <-
           Application.get_env(:libcluster, :topologies) do
      Logger.info("Topologies: #{inspect(cluster_topologies)}")
      {Cluster.Supervisor, [cluster_topologies, [name: Lotta.ClusterSupervisor]]}
    end
  end

  defp get_chromic_app_child() do
    config = Application.get_env(:lotta, ChromicPDF, [])

    if Keyword.get(config, :disabled) != true,
      do: {ChromicPDF, Keyword.get(config, :config)}
  end

  defp get_tcp_healthcheck_app_child() do
    config = Application.get_env(:lotta, Lotta.TCPHealthCheck, [])

    if Keyword.get(config, :disabled) != true,
      do: {TcpHealthCheck, Keyword.get(config, :config, [])}
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    LottaWeb.Endpoint.config_change(changed, removed)
    CockpitWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
