defmodule LottaWeb.Schema.Accounts.UserDevice do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :register_device_input do
    field :custom_name, :string
    field :platform, non_null(:string)
    field :device_type, non_null(:string)
    field :model_name, non_null(:string)
    field :push, :push_input
  end

  input_object :update_device_input do
    field :custom_name, :string
    field :device_type, non_null(:string)
    field :push, :push_input
  end

  input_object :push_input do
    field :token, :string
    field :token_type, :string
  end

  object :device do
    field :id, :id
    field :inserted_at, :datetime
    field :updated_at, :datetime
    field :last_used, :datetime
    field :custom_name, :string
    field :platform, :string
    field :device_type, :string
    field :model_name, :string
  end
end
