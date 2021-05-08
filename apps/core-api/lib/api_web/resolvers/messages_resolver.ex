defmodule ApiWeb.MessagesResolver do
  @moduledoc false

  import ApiWeb.ErrorHelpers
  import Api.Accounts.Permissions

  alias ApiWeb.Context
  alias Api.Messages

  def all(_args, %{context: %Context{current_user: current_user}}) do
    {:ok, Messages.list_for_user(current_user)}
  end

  def create(%{message: message}, %{context: %Context{current_user: current_user}}) do
    fetch_id = fn key ->
      case message[key] do
        %{id: id} ->
          String.to_integer(id)

        _ ->
          nil
      end
    end

    error =
      case message do
        %{recipient_group: %{id: _id}} ->
          unless user_is_in_groups_list?(current_user, [fetch_id.(:recipient_group)]),
            do: {:error, "Du kannst dieser Gruppe keine Nachricht senden."}

        _ ->
          nil
      end

    error ||
      Map.new()
      |> Map.put(:sender_user_id, current_user.id)
      |> Map.put(:content, message[:content])
      |> Map.put(:recipient_user_id, fetch_id.(:recipient_user))
      |> Map.put(:recipient_group_id, fetch_id.(:recipient_group))
      |> Messages.create_message()
      |> format_errors("Nachricht konnte nicht versandt werden.")
  end

  def delete(%{id: id}, %{context: %Context{current_user: current_user}}) do
    message = Messages.get_message(id)

    cond do
      is_nil(message) ->
        {:error, "Nachricht nicht gefunden."}

      not is_author?(current_user, message) ->
        {:error, "Du darfst diese Nachricht nicht löschen."}

      true ->
        Messages.delete_message(message)
    end
  end
end
