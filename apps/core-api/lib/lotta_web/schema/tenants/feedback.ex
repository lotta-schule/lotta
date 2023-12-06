defmodule LottaWeb.Schema.Tenants.Feedback do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :feedback do
    field :id, :id
    field :inserted_at, :datetime
    field :updated_at, :datetime
    field :topic, :string
    field :content, :string
    field :is_new, :boolean
    field :is_forwarded, :boolean
    field :is_responded, :boolean
    field :metadata, :string

    field :user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Lotta.Accounts)
  end

  input_object :create_feedback_input do
    field :topic, non_null(:string)
    field :content, non_null(:string)
    field :metadata, :string
  end
end
