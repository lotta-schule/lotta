defmodule Lotta.Notification.PushNotification do
  @moduledoc """
  This module is responsible for sending push notifications to users.
  It provides functions to send notifications for different events and
  takes care of dispatching them to the correct provider for the
  corresponding users' devices.
  """

  require Logger

  alias Lotta.{Accounts, Repo}
  alias Lotta.Accounts.User
  alias Lotta.Messages.{Conversation, Message}
  alias Pigeon.APNS.Notification

  @spec handle_message_sent_notification(Message.t(), Conversation.t(), Tenant.t()) :: :ok
  def handle_message_sent_notification(message, conversation, tenant) do
    case conversation do
      %Conversation{groups: [], users: users} ->
        users

      %Conversation{groups: groups, users: []} ->
        Accounts.list_users_for_groups(groups, prefix: Ecto.get_meta(message, :prefix))
    end
    |> Enum.filter(&(&1.id != message.user_id))
    |> Enum.each(fn user ->
      user
      |> Repo.preload(:devices)
      |> Map.get(:devices)
      |> Enum.filter(& &1.push_token)
      |> Enum.each(fn device ->
        [_, token] = String.split(device.push_token, "/")

        Notification.new("", token, get_topic())
        |> put_alert(conversation, message)
        |> Notification.put_content_available()
        |> Notification.put_sound("default")
        |> Notification.put_thread_id("#{tenant.slug}/#{conversation.id}")
        |> Notification.put_category("receive_message")
        |> Notification.put_custom(%{
          "user_id" => user.id,
          "tenant_id" => tenant.id,
          "conversation_id" => conversation.id,
          "message_id" => message.id
        })
        |> Lotta.Notification.Provider.APNS.push()
        |> tap(&log_notification(&1))
      end)
    end)

    :ok
  end

  @spec handle_read_conversation_notification(User.t(), Conversation.t(), Tenant.t()) :: :ok
  def handle_read_conversation_notification(user, conversation, tenant) do
    user
    |> Repo.preload(:devices)
    |> Map.get(:devices)
    |> Enum.filter(& &1.push_token)
    |> Enum.each(fn device ->
      [_, token] = String.split(device.push_token, "/")

      %Notification{device_token: token, topic: get_topic()}
      |> Notification.put_custom(%{
        "user_id" => user.id,
        "tenant_id" => tenant.id,
        "conversation_id" => conversation.id
      })
      |> Lotta.Notification.Provider.APNS.push()
      |> tap(&log_notification(&1))
    end)

    :ok
  end

  defp put_alert(notification, conversation, message) do
    Map.new()
    |> put_alert_title(conversation, message)
    |> put_alert_subtitle(conversation, message)
    |> put_alert_body(conversation, message)
    |> then(&Notification.put_alert(notification, &1))
  end

  defp put_alert_title(alert, _, message),
    do: Map.put(alert, :title, message.user.name)

  defp put_alert_subtitle(alert, %Conversation{groups: [group]}, _),
    do: Map.put(alert, :subtitle, "in #{group.name}")

  defp put_alert_subtitle(alert, _, _), do: alert

  defp put_alert_body(alert, _, %Message{content: content}),
    do: Map.put(alert, :body, String.slice(content, 0, 100))

  defp put_alert_body(alert, _, _), do: alert

  defp log_notification(notification),
    do: Logger.info("Sent notification: #{inspect(notification)}")

  defp get_topic() do
    Application.get_env(:lotta, Lotta.Notification.Provider.APNS)
    |> Keyword.get(:topic, "net.einsa.lotta")
  end
end
