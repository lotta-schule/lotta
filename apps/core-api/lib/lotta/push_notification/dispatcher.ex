defmodule Lotta.PushNotification.Dispatcher do
  @moduledoc """
  This module is responsible for sending push notifications to users.
  It provides functions to send notifications for different events and
  takes care of dispatching them to the correct provider for the
  corresponding users' devices.
  """
  use GenServer

  require Logger

  alias Lotta.{Messages, PushNotification, Repo}

  def create_new_message_notifications(tenant, message, conversation) do
    GenServer.cast(__MODULE__, {:schedule, {:message_sent, tenant, message, conversation}})
  end

  def create_conversation_read_notification(tenant, user, conversation) do
    GenServer.cast(__MODULE__, {:schedule, {:conversation_read, tenant, user, conversation}})
  end

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  @impl true
  def init([]) do
    {:ok, :queue.new(), {:continue, :process}}
  end

  @impl true
  def handle_cast({:schedule, notification}, state) do
    {:noreply, :queue.in(notification, state), {:continue, :process}}
  end

  @impl true
  def handle_continue(:process, state) do
    case :queue.out(state) do
      {:empty, _} ->
        {:noreply, state}

      {{:value, notification}, state} ->
        Logger.info("Process notification: #{inspect(notification)}")
        process_notification(notification)
        {:noreply, state, {:continue, :process}}
    end
  end

  defp process_notification({:message_sent, tenant, message, conversation}) do
    message
    |> list_recipients_for_message(conversation)
    |> Enum.each(fn user ->
      PushNotification.Request.new(tenant)
      |> PushNotification.Request.put_title(message.user.name)
      |> PushNotification.Request.put_subtitle(
        if Enum.count(conversation.groups) == 1,
          do: "in #{List.first(conversation.groups).name}"
      )
      |> PushNotification.Request.put_body(message.content)
      |> PushNotification.Request.put_thread_id("#{tenant.slug}/#{conversation.id}")
      |> PushNotification.Request.put_category("receive_message")
      |> PushNotification.Request.put_data(%{
        "user_id" => user.id,
        "tenant_id" => tenant.id,
        "conversation_id" => conversation.id,
        "message_id" => message.id
      })
      |> push_to_user(user)
      |> tap(fn notification ->
        :telemetry.execute(
          [:lotta, :push_notification, :message_sent, :sent],
          %{system_time: System.system_time()},
          %{
            tenant: tenant,
            user: user,
            message: message,
            conversation: conversation,
            notification: notification
          }
        )
      end)
    end)
  end

  defp process_notification({:conversation_read, tenant, user, conversation}) do
    PushNotification.Request.new(tenant)
    |> Map.put(:push_type, :background)
    |> PushNotification.Request.put_category("read_conversation")
    |> PushNotification.Request.put_data(%{
      "user_id" => user.id,
      "tenant_id" => tenant.id,
      "conversation_id" => conversation.id
    })
    |> push_to_user(user)

    :telemetry.execute(
      [:lotta, :push_notification, :conversation_read, :sent],
      %{system_time: System.system_time()},
      %{tenant: tenant, user: user, conversation: conversation}
    )
  end

  defp process_notification(notification) do
    Logger.error("Unknown notification type: #{inspect(notification)}")
  end

  defp push_to_user(notification, user) do
    user
    |> Repo.preload(:devices, prefix: Ecto.get_meta(user, :prefix))
    |> Map.get(:devices)
    |> Enum.filter(& &1.push_token)
    |> Enum.each(&push_to_device(notification, &1))
  end

  defp push_to_device(notification, device) do
    with [type, token] <- String.split(device.push_token, "/"),
         true <- PushNotification.enabled?(type) do
      case type do
        "apns" ->
          notification
          |> PushNotification.Request.create_apns_notification(token)
          |> push(:apns)

        "fcm" ->
          notification
          |> PushNotification.Request.create_fcm_notification({:token, token})
          |> push(:fcm)

        _ ->
          Logger.error("Error sending notification: Unknown token type #{type}")
      end
    else
      _ ->
        Logger.error("Error sending notification: Push notification provider not enabled")
    end
  end

  defp list_recipients_for_message(message, conversation) do
    conversation
    |> Messages.list_conversation_users()
    |> Enum.filter(&(&1.id != message.user_id))
  end

  defp push(notification, provider) do
    provider
    |> PushNotification.provider_name()
    |> Pigeon.push(notification, on_response: &log_notification/1)
  end

  defp log_notification(notification),
    do: Logger.info("Sent notification: #{inspect(notification)}")
end
