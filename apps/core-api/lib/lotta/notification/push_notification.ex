defmodule Lotta.Notification.PushNotification do
  @moduledoc """
  This module is responsible for sending push notifications to users.
  It provides functions to send notifications for different events and
  takes care of dispatching them to the correct provider for the
  corresponding users' devices.
  """

  alias Lotta.{Accounts, Messages, Repo}
  alias Lotta.Messages.Conversation
  alias Pigeon.APNS.Notification

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

        notification =
          Notification.new(message.user.name, token, get_topic())
          |> Notification.put_content_available()
          |> Notification.put_badge(
            Messages.count_unread_messages(
              user
              |> Map.put(
                :all_groups,
                Repo.preload(user, :groups).groups ++
                  (user.enrollment_tokens
                   |> Accounts.list_groups_for_enrollment_tokens(tenant))
              )
            )
          )
          |> put_alert(conversation, message)
          |> Notification.put_sound("default")
          |> Notification.put_thread_id("#{tenant.slug}/#{conversation.id}")
          |> Notification.put_custom(%{conversation_id: conversation.id, message_id: message.id})
          |> Lotta.Notification.Provider.APNS.push()

        Logger.info("Sent notification: #{inspect(notification)}")
      end)
    end)
  end

  defp put_alert(notification, conversation, message) do
    conf =
      %{}
      |> then(fn map ->
        if group = List.first(conversation.groups),
          do: Map.put(map, :subtitle, "in #{group.name}"),
          else: map
      end)
      |> then(fn map ->
        if message.content && String.length(message.content) > 0,
          do: Map.put(map, :body, message.content),
          else: map
      end)

    notification
    |> Notification.put_alert(conf)
  end

  defp get_topic() do
    Application.get_env(:lotta, Lotta.Notification.Provider.APNS)
    |> Keyword.get(:topic, "net.einsa.lotta")
  end
end
