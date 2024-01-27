defmodule LottaWeb.Schema.Messages do
  @moduledoc false

  use Absinthe.Schema.Notation

  alias Lotta.{Tenants, Repo}
  alias Lotta.Messages.Conversation

  object :messages_queries do
    field :conversations, list_of(:conversation) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      resolve(&LottaWeb.MessagesResolver.list_conversations/2)
    end

    field :conversation, :conversation do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))
      arg(:mark_as_read, :boolean)

      resolve(&LottaWeb.MessagesResolver.get_conversation/2)
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
        _args,
        %{
          context: %{current_user: %{id: user_id, all_groups: groups}, tenant: %{id: tid}}
        } ->
          {:ok,
           topic: [
             "#{tid}:messages:user:#{user_id}"
             | Enum.map(groups, &"#{tid}:messages:group:#{&1.id}")
           ]}

        _args, _context ->
          {:error, "unauthorized"}
      end)

      # this tells Absinthe to run any subscriptions with this field every time
      # the :submit_comment mutation happens.
      # It also has a topic function used to find what subscriptions care about
      # this particular comment
      trigger(:create_message,
        topic: fn message ->
          prefix = Ecto.get_meta(message, :prefix)
          tenant = Tenants.get_tenant_by_prefix(prefix)

          message = Repo.preload(message, [:conversation, :user, :files])
          conversation = Repo.preload(message.conversation, [:users, :groups])

          Lotta.Notification.PushNotification.create_new_message_notifications(
            tenant,
            message,
            conversation
          )

          if tenant do
            tid = tenant.id

            case conversation do
              %Conversation{groups: [], users: users} ->
                Enum.map(users, &"#{tid}:messages:user:#{&1.id}")

              %Conversation{groups: groups, users: []} ->
                Enum.map(groups, &"#{tid}:messages:group:#{&1.id}")
            end
          end
        end
      )

      resolve(fn message, _, _ ->
        # this function is often not actually necessary, as the default resolver
        # for subscription functions will just do what we're doing here.
        # The point is, subscription resolvers receive whatever value triggers
        # the subscription, in our case a comment.
        {:ok, message}
      end)
    end
  end
end
