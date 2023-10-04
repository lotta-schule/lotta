defmodule LottaWeb.Schema.Accounts.UserDevice do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :register_device_input do
    field :custom_name, :string
    field :platform_id, non_null(:string)
    field :device_type, :string
    field :operating_system, :string
    field :model_name, :string
    field :push_token, :string
  end

  input_object :update_device_input do
    field :custom_name, :string
    field :device_type, :string
    field :push_token, :string
  end

  object :device do
    field :id, :id
    field :custom_name, :string
    field :platform_id, :string
    field :device_type, :string
    field :operating_system, :string
    field :model_name, :string
    field :last_used, :datetime
    field :inserted_at, :datetime
    field :updated_at, :datetime
  end
end
