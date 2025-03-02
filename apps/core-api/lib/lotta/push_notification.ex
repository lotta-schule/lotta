defmodule Lotta.PushNotification do
  use Supervisor

  alias Lotta.PushNotification

  defdelegate create_conversation_read_notification(tenant, message, conversation),
    to: PushNotification.Dispatcher

  defdelegate create_new_message_notifications(tenant, user, conversation),
    to: PushNotification.Dispatcher

  def enabled?(:goth), do: enabled?(:fcm)

  def enabled?(provider) when is_atom(provider) do
    config = get_config(provider)

    provider
    |> obligatory_config_keys()
    |> Enum.all?(&(to_string(config[&1]) != ""))
  end

  def enabled?(provider) when is_binary(provider) do
    enabled?(String.to_existing_atom(provider))
  rescue
    _ -> false
  end

  def get_config(provider) do
    Keyword.get(Application.get_env(:lotta, Lotta.PushNotification), provider, [])
  end

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  def init(_args) do
    children =
      [
        Lotta.PushNotification.Dispatcher,
        {Registry, keys: :unique, name: Registry.Lotta.PushNotification}
      ] ++ enabled_providers()

    Supervisor.init(children, strategy: :one_for_one, name: __MODULE__)
  end

  def provider_name(:goth),
    do: {:via, Registry, {Registry.Lotta.PushNotification, Lotta.PushNotification.Goth}}

  def provider_name(:fcm),
    do: {:via, Registry, {Registry.Lotta.PushNotification, Lotta.PushNotification.Provider.FCM}}

  def provider_name(:apns),
    do: {:via, Registry, {Registry.Lotta.PushNotification, Lotta.PushNotification.Provider.APNS}}

  defp enabled_providers() do
    [:fcm, :apns, :goth]
    |> Enum.filter(&enabled?/1)
    |> Enum.map(&get_provider_spec/1)
  end

  defp obligatory_config_keys(:apns), do: [:key, :key_identifier, :team_id, :prod?]
  defp obligatory_config_keys(:fcm), do: [:service_account_json, :project_id]

  defp sandbox_enabled?, do: get_config(:sandbox?)

  defp get_provider_spec(:goth) do
    Supervisor.child_spec({Goth, get_provider_args(:goth)}, id: provider_name(:goth))
  end

  defp get_provider_spec(provider) do
    Supervisor.child_spec({Pigeon.Dispatcher, get_provider_args(provider)},
      id: provider_name(provider)
    )
  end

  defp get_provider_args(:fcm) do
    config = get_config(:fcm)

    [
      adapter: if(sandbox_enabled?(), do: Pigeon.Sandbox, else: Pigeon.FCM),
      auth: provider_name(:goth),
      project_id: config[:project_id],
      name: provider_name(:fcm)
    ]
  end

  defp get_provider_args(:goth) do
    config = get_config(:fcm)

    [
      service_account: Jason.decode!(config[:service_account_json]),
      name: provider_name(:goth)
    ]
  end

  defp get_provider_args(:apns) do
    config = get_config(:apns)

    [
      adapter: if(sandbox_enabled?(), do: Pigeon.Sandbox, else: Pigeon.APNS),
      key: config[:key],
      key_identifier: config[:key_identifier],
      team_id: config[:team_id],
      topic: config[:topic],
      mode: config[:prod?],
      name: provider_name(:apns)
    ]
  end
end
