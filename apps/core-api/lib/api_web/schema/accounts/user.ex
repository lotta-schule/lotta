defmodule ApiWeb.Schema.Accounts.User do
  @moduledoc false

  use Absinthe.Schema.Notation

  input_object :register_user_params do
    field :name, :string
    field :nickname, :string
    field :hide_full_name, :boolean
    field :email, :string
    field :password, :string
  end

  input_object :update_user_params do
    field :name, :string
    field :email, :string
    field :class, :string
    field :nickname, :string
    field :hide_full_name, :boolean
    field :avatar_image_file, list_of(:select_file_input)
    field :enrollment_tokens, list_of(:string)
  end

  input_object :select_user_input do
    field :id, :lotta_id
  end

  input_object :select_user_group_input do
    field :id, :lotta_id
  end

  input_object :user_group_input do
    field :name, :string
    field :sort_key, :integer
    field :enrollment_tokens, list_of(:string)
    field :is_admin_group, :boolean
  end

  object :authresult do
    field :token, :string
  end

  object :user do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :last_seen, :naive_datetime
    field :name, :string, resolve: &Api.UserResolver.resolve_name/3
    field :class, :string
    field :nickname, :string
    field :email, :string
    field :hide_full_name, :boolean
    field :tenant, :tenant, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
    field :avatar_image_file, :file, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)

    field :articles, list_of(:article),
      resolve: Absinthe.Resolution.Helpers.dataloader(Api.Content)

    field :groups, list_of(:user_group), resolve: &Api.UserResolver.resolve_groups/3

    field :assigned_groups, list_of(:user_group),
      resolve: &Api.UserResolver.resolve_assigned_groups/3

    field :enrollment_tokens, list_of(:string),
      resolve: &Api.UserResolver.resolve_enrollment_tokens/3

    field :is_blocked, :boolean, resolve: &Api.UserResolver.resolve_is_blocked/3
  end

  object :user_group do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :name, :string
    field :sort_key, :integer
    field :is_admin_group, :boolean
    field :tenant, :tenant, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)

    field :enrollment_tokens, list_of(:group_enrollment_token),
      resolve: &Api.UserGroupResolver.resolve_enrollment_tokens/3
  end

  object :group_enrollment_token do
    field :id, :lotta_id
    field :token, :string
  end
end
