defmodule ApiWeb.Schema.Messages do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :messages_queries do
    field :messages, list_of(:message) do
      middleware(ApiWeb.Schema.Middleware.EnsureAuthenticated)
      resolve(&ApiWeb.MessagesResolver.all/2)
    end
  end

  object :messages_mutations do
    field :create_message, type: :message do
      middleware(ApiWeb.Schema.Middleware.EnsureAuthenticated)
      arg(:message, non_null(:message_input))
      resolve(&ApiWeb.MessagesResolver.create/2)
    end
  end
end
