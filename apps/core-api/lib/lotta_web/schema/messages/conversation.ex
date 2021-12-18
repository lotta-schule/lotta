defmodule LottaWeb.Schema.Messages.Conversation do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :conversation do
    field :id, :id

    field :messages, list_of(non_null(:message)),
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Messages)

    field :users, list_of(non_null(:user)),
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Accounts)

    field :groups, list_of(non_null(:user_group)),
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Accounts)

    field :unread_messages, :integer,
      resolve: &LottaWeb.MessagesResolver.resolve_conversation_unread_messages/2

    field :inserted_at, :datetime
    field :updated_at, :datetime
  end
end
