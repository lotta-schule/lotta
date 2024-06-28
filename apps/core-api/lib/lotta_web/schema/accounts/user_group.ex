defmodule LottaWeb.Schema.Accounts.UserGroup do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :select_user_group_input do
    field :id, :id
  end

  input_object :user_group_input do
    field :name, :string
    field :sort_key, :integer
    field :enrollment_tokens, list_of(:string)
    field :is_admin_group, :boolean
    field :can_read_full_name, :boolean
  end

  object :user_group do
    field :id, :id
    field :inserted_at, :datetime
    field :updated_at, :datetime
    field :name, :string
    field :sort_key, :integer
    field :is_admin_group, :boolean
    field :can_read_full_name, :boolean

    field :enrollment_tokens, list_of(:string),
      resolve: &LottaWeb.UserGroupResolver.resolve_enrollment_tokens/3
  end

  object :delete_user_group_result do
    field :user_group, :user_group
    field :unpublished_articles, list_of(:article)
  end
end
