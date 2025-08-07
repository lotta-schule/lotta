defmodule Lotta.PushNotification do
  @moduledoc """
  Handles push notifications for the Lotta application.
  This module provides the API surface for sending push notifications to users.
  It is also being a supervisor and manages the necessary processs
  """
  use Supervisor

  alias Lotta.PushNotification
  alias Lotta.Accounts.User
  alias Lotta.Messages.{Conversation, Message}
  alias Lotta.Tenants.Tenant

  @doc """
  Create a message notifying a device about the changed read status of a message.
  """
  @spec create_conversation_read_notification(Tenant.t(), Message.t(), Conversation.t()) :: :ok
  defdelegate create_conversation_read_notification(tenant, message, conversation),
    to: PushNotification.Dispatcher

  @doc """
  Create a message notifying a device about a new message in a conversation.
  """
  @spec create_new_message_notifications(Tenant.t(), User.t(), Conversation.t()) :: :ok
  defdelegate create_new_message_notifications(tenant, user, conversation),
    to: PushNotification.Dispatcher

  @doc """
  Wether push notifications can be sent to a given provider.
  Supported providers are `:fcm` and `:apns`.
  """
  @spec enabled?(provider :: atom() | binary()) :: boolean()
  def enabled?(provider)
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

  @doc """
  Returns the configuration for a given provider.

  ## Examples

      iex> PushNotification.get_config(:fcm)
      [service_account_json: "{}", project_id: "123456"]

      iex> PushNotification.get_config(:no)
      nil
  """
  def get_config(provider) do
    Keyword.get(Application.get_env(:lotta, Lotta.PushNotification), provider, [])
  end

  @doc false
  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @doc false
  def init(_args) do
    children =
      [
        Lotta.PushNotification.Dispatcher,
        {Registry, keys: :unique, name: Registry.Lotta.PushNotification}
      ] ++ enabled_providers()

    Supervisor.init(children, strategy: :one_for_one, name: __MODULE__)
  end

  @doc false
  def provider_name(provider)

  def provider_name(:goth),
    do: Lotta.PushNotification.Goth

  def provider_name(:fcm),
    do: {:via, Registry, {Registry.Lotta.PushNotification, Lotta.PushNotification.Provider.FCM}}

  def provider_name(:apns),
    do: {:via, Registry, {Registry.Lotta.PushNotification, Lotta.PushNotification.Provider.APNS}}

  defp enabled_providers() do
    [:goth, :fcm, :apns]
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
      source: {:service_account, Jason.decode!(config[:service_account_json])},
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
      mode:
        case config[:prod?] do
          true -> :prod
          _ -> :dev
        end,
      name: provider_name(:apns)
    ]
  end
end
