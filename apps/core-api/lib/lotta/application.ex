defmodule Lotta.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    environment = Application.fetch_env!(:lotta, :environment)

    :opentelemetry_cowboy.setup()
    OpentelemetryPhoenix.setup(adapter: :cowboy2)
    OpentelemetryAbsinthe.setup()
    OpentelemetryEcto.setup([:lotta, :repo])
    OpentelemetryRedix.setup()

    # List all child processes to be supervised
    children =
      (prepended_apps(environment) ++
         [
           {Phoenix.PubSub, name: Lotta.PubSub, adapter: Phoenix.PubSub.PG2},
           Lotta.Repo,
           LottaWeb.Endpoint,
           {Absinthe.Subscription, LottaWeb.Endpoint},
           {Redix, Application.fetch_env!(:lotta, :redis_connection)},
           Lotta.Queue.MediaConversionRequestPublisher,
           Lotta.Queue.MediaConversionConsumer,
           Lotta.Notification.PushNotification,
           {ConCache,
            name: :http_cache, ttl_check_interval: :timer.hours(1), global_ttl: :timer.hours(4)}
         ]) ++ appended_apps(environment)

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    Supervisor.start_link(children, strategy: :one_for_one, name: Lotta.Supervisor)
  end

  defp prepended_apps(:production) do
    # libcluster setting
    topologies = [
      k8s: [
        strategy: Elixir.Cluster.Strategy.Kubernetes.DNS,
        config: [
          service: System.get_env("HEADLESS_SERVICE_NAME"),
          application_name: System.get_env("APP_NAME"),
          polling_interval: 5000
        ]
      ]
    ]

    [{Cluster.Supervisor, [topologies, [name: Lotta.ClusterSupervisor]]}]
  end

  defp prepended_apps(_), do: []

  defp appended_apps(:test), do: []

  defp appended_apps(_) do
    []
    |> then(fn apps ->
      if Keyword.get(Application.get_env(:lotta, Lotta.Notification.Provider.APNS), :key),
        do: apps ++ [Lotta.Notification.Provider.APNS],
        else: apps
    end)
    |> then(fn apps ->
      if Keyword.get(
           Application.get_env(:lotta, Lotta.Notification.Provider.FCM),
           :service_account_json
         ),
         do: apps ++ [Lotta.Notification.Provider.FCM],
         else: apps
    end)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    LottaWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
