defmodule Lotta.Notification.PushNotification do
  @moduledoc """
  This module is responsible for sending push notifications to users.
  It provides functions to send notifications for different events and
  takes care of dispatching them to the correct provider for the
  corresponding users' devices.
  """
  use GenServer

  require Logger

  alias Lotta.{Messages, Repo}
  alias Lotta.Notification.PushNotificationRequest

  def create_new_message_notifications(tenant, message, conversation) do
    GenServer.call(__MODULE__, {:schedule, {:message_sent, tenant, message, conversation}})
  end

  def create_conversation_read_notification(tenant, user, conversation) do
    GenServer.call(__MODULE__, {:schedule, {:conversation_read, tenant, user, conversation}})
  end

  def start_link(args) do
    Logger.info("Starting PushNotification Queue")
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  @impl true
  def init([]) do
    {:ok, :queue.new(), {:continue, :process}}
  end

  @impl true
  def handle_call({:schedule, notification}, _from, state) do
    {:reply, :ok, :queue.in(notification, state), {:continue, :process}}
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
      PushNotificationRequest.new(tenant)
      |> PushNotificationRequest.put_title(message.user.name)
      |> PushNotificationRequest.put_subtitle(
        if Enum.count(conversation.groups) == 1, do: "in #{List.first(conversation.groups).name}"
      )
      |> PushNotificationRequest.put_body(message.content)
      |> PushNotificationRequest.put_thread_id("#{tenant.slug}/#{conversation.id}")
      |> PushNotificationRequest.put_category("receive_message")
      |> PushNotificationRequest.put_data(%{
        "user_id" => user.id,
        "tenant_id" => tenant.id,
        "conversation_id" => conversation.id,
        "message_id" => message.id
      })
      |> push_to_user(user)
    end)
  end

  defp process_notification({:conversation_read, tenant, user, conversation}) do
    PushNotificationRequest.new(tenant)
    |> PushNotificationRequest.put_category("receive_message")
    |> PushNotificationRequest.put_data(%{
      "user_id" => user.id,
      "tenant_id" => tenant.id,
      "conversation_id" => conversation.id
    })
    |> push_to_user(user)
  end

  defp process_notification(notification) do
    Logger.error("Unknown notification type: #{inspect(notification)}")
  end

  defp push_to_user(notification, user) do
    user
    |> Repo.preload(:devices)
    |> Map.get(:devices)
    |> Enum.filter(& &1.push_token)
    |> Enum.each(&push_to_device(notification, &1))
  end

  defp push_to_device(notification, device) do
    with [type, token] <- String.split(device.push_token, "/") do
      case type do
        "apns" ->
          notification
          |> PushNotificationRequest.create_apns_notification(token)
          |> Lotta.Notification.Provider.APNS.push()
          |> tap(&log_notification/1)

        "fcm" ->
          notification
          |> PushNotificationRequest.create_fcm_notification({:token, token})
          |> Lotta.Notification.Provider.FCM.push()
          |> tap(&log_notification/1)

        _ ->
          Logger.error("Error sending notification: Unknown token type #{type}")
      end
    end
  end

  defp list_recipients_for_message(message, conversation) do
    conversation
    |> Messages.list_conversation_users()
    |> Enum.filter(&(&1.id != message.user_id))
  end

  defp log_notification(notification),
    do: Logger.info("Sent notification: #{inspect(notification)}")
end
