defmodule ApiWeb.Schema.Messages.Message do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :message_input do
    field :content, :string
    field :recipient_user, :select_user_input
    field :recipient_group, :select_user_group_input
  end

  object :message do
    field :id, :id
    field :sender_user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :recipient_user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)

    field :recipient_group, :user_group,
      resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)

    field :content, :string
    field :inserted_at, :datetime
    field :updated_at, :datetime
  end
end
