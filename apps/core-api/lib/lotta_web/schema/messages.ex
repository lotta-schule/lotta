defmodule LottaWeb.Schema.Messages do
  @moduledoc false

  use Absinthe.Schema.Notation

  alias Lotta.Messages.Message

  object :messages_queries do
    field :messages, list_of(:message) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      resolve(&LottaWeb.MessagesResolver.all/2)
    end
  end

  object :messages_mutations do
    field :create_message, type: :message do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:message, non_null(:message_input))

      resolve(&LottaWeb.MessagesResolver.create/2)
    end

    field :delete_message, type: :message do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.MessagesResolver.delete/2)
    end
  end

  object :messages_subscriptions do
    field :receive_message, :message do
      config(fn
        _args, %{context: %{current_user: %{id: user_id, all_groups: groups}}} ->
          {:ok,
           topic: ["messages:user:#{user_id}" | Enum.map(groups, &"messages:group:#{&1.id}")]}
      end)

      # this tells Absinthe to run any subscriptions with this field every time
      # the :submit_comment mutation happens.
      # It also has a topic function used to find what subscriptions care about
      # this particular comment
      trigger(:create_message,
        topic: fn message ->
          case message do
            %Message{sender_user_id: sender_id, recipient_user_id: user_id}
            when not is_nil(user_id) ->
              ["messages:user:#{sender_id}", "messages:user:#{user_id}"]

            %Message{recipient_group_id: group_id} when not is_nil(group_id) ->
              "messages:group:#{group_id}"
          end
        end
      )

      resolve(fn comment, _, _ ->
        # this function is often not actually necessary, as the default resolver
        # for subscription functions will just do what we're doing here.
        # The point is, subscription resolvers receive whatever value triggers
        # the subscription, in our case a comment.
        {:ok, comment}
      end)
    end
  end
end
