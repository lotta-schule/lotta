defmodule LottaWeb.Schema.Messages.Message do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :message_input do
    field :content, :string
    field :recipient_user, :select_user_input
    field :recipient_group, :select_user_group_input
  end

  object :message do
    field :id, :id
    field :user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Accounts)

    field :conversation, :conversation,
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Messages)

    field :content, :string
    field :inserted_at, :datetime
    field :updated_at, :datetime
  end
end
