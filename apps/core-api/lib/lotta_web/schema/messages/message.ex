defmodule LottaWeb.Schema.Messages.Message do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :message_input do
    field :content, :string
    field :files, list_of(non_null(:select_file_input))
    field :recipient_user, :select_user_input
    field :recipient_group, :select_user_group_input
  end

  object :message do
    field :id, non_null(:id)
    field :user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Accounts)

    field :conversation, non_null(:conversation),
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Messages)

    field :content, :string

    field :files, list_of(non_null(:file)),
      resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Storage)

    field :inserted_at, non_null(:datetime)
    field :updated_at, non_null(:datetime)
  end
end
