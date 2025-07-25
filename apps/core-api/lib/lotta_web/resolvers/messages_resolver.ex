defmodule LottaWeb.MessagesResolver do
  @moduledoc false

  import LottaWeb.ErrorHelpers
  import Lotta.Accounts.Permissions

  alias Lotta.{Accounts, Messages, PushNotification}
  alias Lotta.Messages.Conversation

  def resolve_conversation_unread_messages(_args, %{
        context: %{current_user: user},
        source: %Conversation{} = conversation
      }) do
    {:ok, Messages.count_unread_messages(user, conversation)}
  end

  def list_conversations(_args, %{context: %{current_user: current_user}}) do
    {:ok, Messages.list_active_conversations(current_user)}
  end

  def get_conversation(%{id: id} = args, %{
        context: %{tenant: tenant, current_user: current_user}
      }) do
    conversation = Messages.get_conversation(id)

    cond do
      is_nil(conversation) ->
        {:error, "Unterhaltung nicht gefunden."}

      not can_read?(current_user, conversation) ->
        {:error, "Du hast nicht die Rechte, diese Unterhaltung anzusehen."}

      true ->
        if args[:mark_as_read] != false do
          Messages.set_user_has_last_seen_conversation(current_user, conversation)

          PushNotification.create_conversation_read_notification(
            tenant,
            current_user,
            conversation
          )
        end

        {:ok, conversation}
    end
  end

  def create(%{message: message}, %{context: %{current_user: current_user}}) do
    {recipient_user, recipient_group} = get_message_recipient(message)

    error =
      cond do
        is_nil(recipient_group) and is_nil(recipient_user) ->
          {:error, "Du hast keinen Empfänger für die Nachricht ausgewählt."}

        not is_nil(recipient_group) and
            not user_is_in_groups_list?(current_user, [recipient_group]) ->
          {:error, "Du darfst dieser Gruppe keine Nachricht senden."}

        true ->
          nil
      end

    error ||
      Messages.create_message(
        current_user,
        recipient_user || recipient_group,
        message[:content],
        message[:files]
      )
      |> format_errors("Nachricht konnte nicht versandt werden.")
  end

  defp get_message_recipient(message) do
    fetch_id = fn key ->
      case message[key] do
        %{id: id} ->
          String.to_integer(id)

        _ ->
          nil
      end
    end

    user =
      if user_id = fetch_id.(:recipient_user) do
        Accounts.get_user(user_id)
      end

    group =
      if group_id = fetch_id.(:recipient_group) do
        Accounts.get_user_group(group_id)
      end

    {user, group}
  end

  def delete(%{id: id}, %{context: %{current_user: current_user}}) do
    message = Messages.get_message(id)

    cond do
      is_nil(message) ->
        {:error, "Nachricht nicht gefunden."}

      not author?(current_user, message) ->
        {:error, "Du darfst diese Nachricht nicht löschen."}

      true ->
        Messages.delete_message(message)
    end
  end
end
