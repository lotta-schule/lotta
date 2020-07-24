defmodule ApiWeb.Schema.Accounts do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :accounts_queries do
    field :current_user, :user do
      resolve(&Api.UserResolver.get_current/2)
    end

    field :users, list_of(:user) do
      resolve(&Api.UserResolver.all_with_groups/2)
    end

    field :search_users, list_of(:user) do
      arg(:searchtext, non_null(:string))
      resolve(&Api.UserResolver.search/2)
    end

    field :user, type: :user do
      arg(:id, non_null(:id))
      resolve(&Api.UserResolver.get/2)
    end

    field :group, type: :user_group do
      arg(:id, non_null(:id))
      resolve(&Api.UserGroupResolver.get/2)
    end

    field :directory, :directory do
      arg(:id, :id)
      resolve(&Api.DirectoryResolver.get/2)
    end

    field :directories, list_of(:directory) do
      arg(:parent_directory_id, :id)
      resolve(&Api.DirectoryResolver.list/2)
    end

    field :file, :file do
      arg(:id, :id)
      resolve(&Api.FileResolver.file/2)
    end

    field :files, list_of(:file) do
      arg(:parent_directory_id, :id)
      resolve(&Api.FileResolver.files/2)
    end
  end

  object :accounts_mutations do
    field :register, type: :authresult do
      arg(:user, non_null(:register_user_params))
      arg(:group_key, :string)

      resolve(&Api.UserResolver.register/2)
      middleware(ApiWeb.Schema.Middleware.WriteTokensToContext)
    end

    field :login, type: :authresult do
      arg(:username, :string)
      arg(:password, :string)

      resolve(&Api.UserResolver.login/2)
      middleware(ApiWeb.Schema.Middleware.WriteTokensToContext)
    end

    field :logout, type: :authresult do
      resolve(fn _args, _info ->
        {:ok, %{refresh_token: nil, access_token: nil}}
      end)

      middleware(ApiWeb.Schema.Middleware.WriteTokensToContext)
    end

    field :update_profile, type: :user do
      arg(:user, non_null(:update_user_params))

      resolve(&Api.UserResolver.update_profile/2)
    end

    field :update_password, type: :user do
      arg(:current_password, non_null(:string))
      arg(:new_password, non_null(:string))

      resolve(&Api.UserResolver.update_password/2)
    end

    field :set_user_blocked, type: :user do
      arg(:id, non_null(:id))
      arg(:is_blocked, non_null(:boolean))

      resolve(&Api.UserResolver.set_user_blocked/2)
    end

    field :create_user_group, type: :user_group do
      arg(:group, non_null(:user_group_input))

      resolve(&Api.UserGroupResolver.create/2)
    end

    field :update_user_group, type: :user_group do
      arg(:id, non_null(:id))
      arg(:group, non_null(:user_group_input))

      resolve(&Api.UserGroupResolver.update/2)
    end

    field :delete_user_group, type: :user_group do
      arg(:id, non_null(:id))

      resolve(&Api.UserGroupResolver.delete/2)
    end

    field :request_password_reset, type: :boolean do
      arg(:email, non_null(:string))

      resolve(&Api.UserResolver.request_password_reset/2)
    end

    field :reset_password, type: :authresult do
      arg(:email, non_null(:string))
      arg(:token, non_null(:string))
      arg(:password, non_null(:string))

      resolve(&Api.UserResolver.reset_password/2)
      middleware(ApiWeb.Schema.Middleware.WriteTokensToContext)
    end

    field :set_user_groups, type: :user do
      arg(:id, non_null(:id))
      arg(:group_ids, non_null(list_of(:id)))
      resolve(&Api.UserResolver.set_user_groups/2)
    end

    field :create_directory, type: :directory do
      arg(:name, non_null(:string))
      arg(:parent_directory_id, :id)
      arg(:is_public, :boolean)

      resolve(&Api.DirectoryResolver.create/2)
    end

    field :update_directory, type: :directory do
      arg(:id, non_null(:id))
      arg(:name, :string)
      arg(:parent_directory_id, :id)

      resolve(&Api.DirectoryResolver.update/2)
    end

    field :delete_directory, type: :directory do
      arg(:id, non_null(:id))

      resolve(&Api.DirectoryResolver.delete/2)
    end

    field :upload_file, type: :file do
      arg(:file, non_null(:upload))
      arg(:parent_directory_id, non_null(:id))

      resolve(&Api.FileResolver.upload/2)
    end

    field :delete_file, type: :file do
      arg(:id, non_null(:id))

      resolve(&Api.FileResolver.delete/2)
    end

    field :update_file, type: :file do
      arg(:id, non_null(:id))
      arg(:parent_directory_id, :id)
      arg(:filename, :string)

      resolve(&Api.FileResolver.update/2)
    end
  end
end
