defmodule ApiWeb.Schema.Accounts do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :accounts_queries do
    field :current_user, :user do
      resolve(&ApiWeb.UserResolver.get_current/2)
    end

    field :users, list_of(:user) do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      resolve(&ApiWeb.UserResolver.all/2)
    end

    field :search_users, list_of(:user) do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:searchtext, non_null(:string))

      resolve(&ApiWeb.UserResolver.search/2)
    end

    field :user, type: :user do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))

      resolve(&ApiWeb.UserResolver.get/2)
    end

    field :group, type: :user_group do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&ApiWeb.UserGroupResolver.get/2)
    end

    field :directories, list_of(:directory) do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:parent_directory_id, :id)

      resolve(&ApiWeb.DirectoryResolver.list/2)
    end

    field :directory, :directory do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, :id)

      resolve(&ApiWeb.DirectoryResolver.get/2)
    end

    field :files, list_of(:file) do
      arg(:parent_directory_id, :id)

      resolve(&ApiWeb.FileResolver.files/2)
    end

    field :file, :file do
      arg(:id, :id)

      resolve(&ApiWeb.FileResolver.file/2)
    end

    field :relevant_files_in_usage, list_of(:file) do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      resolve(&ApiWeb.FileResolver.relevant_files_in_usage/2)
    end
  end

  object :accounts_mutations do
    field :register, type: :authresult do
      arg(:user, non_null(:register_user_params))
      arg(:group_key, :string)

      resolve(&ApiWeb.UserResolver.register/2)
      middleware(ApiWeb.Schema.Middleware.WriteTokensToContext)
    end

    field :login, type: :authresult do
      arg(:username, :string)
      arg(:password, :string)

      resolve(&ApiWeb.UserResolver.login/2)
      middleware(ApiWeb.Schema.Middleware.WriteTokensToContext)
    end

    field :logout, type: :authresult do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      resolve(fn _args, _info ->
        {:ok, %{refresh_token: nil, access_token: nil}}
      end)

      middleware(ApiWeb.Schema.Middleware.WriteTokensToContext)
    end

    field :update_profile, type: :user do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:user, non_null(:update_user_params))

      resolve(&ApiWeb.UserResolver.update_profile/2)
    end

    field :update_password, type: :user do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:current_password, non_null(:string))
      arg(:new_password, non_null(:string))

      resolve(&ApiWeb.UserResolver.update_password/2)
    end

    field :destroy_account, type: :user do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:transfer_file_ids, list_of(non_null(:id)))

      resolve(&ApiWeb.UserResolver.destroy_account/2)
    end

    field :create_user_group, type: :user_group do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:group, non_null(:user_group_input))

      resolve(&ApiWeb.UserGroupResolver.create/2)
    end

    field :update_user_group, type: :user_group do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))
      arg(:group, non_null(:user_group_input))

      resolve(&ApiWeb.UserGroupResolver.update/2)
    end

    field :delete_user_group, type: :user_group do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&ApiWeb.UserGroupResolver.delete/2)
    end

    field :request_password_reset, type: :boolean do
      arg(:email, non_null(:string))

      resolve(&ApiWeb.UserResolver.request_password_reset/2)
    end

    field :reset_password, type: :authresult do
      arg(:email, non_null(:string))
      arg(:token, non_null(:string))
      arg(:password, non_null(:string))

      resolve(&ApiWeb.UserResolver.reset_password/2)
      middleware(ApiWeb.Schema.Middleware.WriteTokensToContext)
    end

    field :update_user, type: :user do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))
      arg(:groups, list_of(non_null(:select_user_group_input)))

      resolve(&ApiWeb.UserResolver.update/2)
    end

    field :create_directory, type: :directory do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:name, non_null(:string))
      arg(:parent_directory_id, :id)
      arg(:is_public, :boolean)

      resolve(&ApiWeb.DirectoryResolver.create/2)
    end

    field :update_directory, type: :directory do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))
      arg(:name, :string)
      arg(:parent_directory_id, :id)

      resolve(&ApiWeb.DirectoryResolver.update/2)
    end

    field :delete_directory, type: :directory do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))

      resolve(&ApiWeb.DirectoryResolver.delete/2)
    end

    field :upload_file, type: :file do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:file, non_null(:upload))
      arg(:parent_directory_id, non_null(:id))

      resolve(&ApiWeb.FileResolver.upload/2)
    end

    field :delete_file, type: :file do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))

      resolve(&ApiWeb.FileResolver.delete/2)
    end

    field :update_file, type: :file do
      middleware(ApiWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))
      arg(:parent_directory_id, :id)
      arg(:filename, :string)

      resolve(&ApiWeb.FileResolver.update/2)
    end
  end
end
