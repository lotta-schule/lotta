defmodule LottaWeb.Schema.Accounts do
  @moduledoc false

  use Absinthe.Schema.Notation

  object :accounts_queries do
    field :current_user, :user do
      resolve(&LottaWeb.UserResolver.get_current/2)
    end

    field :devices, list_of(:device) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)
      resolve(&LottaWeb.UserDeviceResolver.get_devices/2)
    end

    field :users, list_of(:user) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      resolve(&LottaWeb.UserResolver.all/2)
    end

    field :search_users, non_null(list_of(non_null(:user))) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:searchtext, :string)
      arg(:groups, list_of(:select_user_group_input))
      arg(:last_seen, :integer)

      resolve(&LottaWeb.UserResolver.search/2)
    end

    field :user, type: :user do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.UserResolver.get/2)
    end

    field :user_groups, type: list_of(:user_group) do
      resolve(&LottaWeb.UserGroupResolver.all/2)
    end

    field :group, type: :user_group do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.UserGroupResolver.get/2)
    end

    field :directories, list_of(:directory) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:parent_directory_id, :id)

      resolve(&LottaWeb.DirectoryResolver.list/2)
    end

    field :directory, :directory do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, :id)

      resolve(&LottaWeb.DirectoryResolver.get/2)
    end

    field :files, list_of(:file) do
      arg(:parent_directory_id, :id)

      resolve(&LottaWeb.FileResolver.files/2)
    end

    field :file, :file do
      arg(:id, :id)

      resolve(&LottaWeb.FileResolver.file/2)
    end

    field :search_files, non_null(list_of(non_null(:file))) do
      arg(:searchterm, :string)

      resolve(&LottaWeb.FileResolver.search_files/2)
    end

    field :search_directories, non_null(list_of(non_null(:directory))) do
      arg(:searchterm, :string)

      resolve(&LottaWeb.FileResolver.search_directories/2)
    end

    field :relevant_files_in_usage, list_of(:file) do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      resolve(&LottaWeb.FileResolver.relevant_files_in_usage/2)
    end
  end

  object :accounts_mutations do
    field :register, type: :boolean do
      arg(:user, non_null(:register_user_params))
      arg(:group_key, :string)

      resolve(&LottaWeb.UserResolver.register/2)
    end

    field :login, type: :authresult do
      arg(:username, :string)
      arg(:password, :string)

      resolve(&LottaWeb.UserResolver.login/2)
      middleware(LottaWeb.Schema.Middleware.WriteTokensToContext)
    end

    field :request_hisec_token, type: :string do
      arg(:password, :string)

      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      resolve(&LottaWeb.UserResolver.request_hisec_token/2)
    end

    field :logout, type: :authresult do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      resolve(fn _args, _info ->
        {:ok, %{refresh_token: nil, access_token: nil}}
      end)

      middleware(LottaWeb.Schema.Middleware.WriteTokensToContext)
    end

    field :update_profile, type: :user do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:user, non_null(:update_user_params))

      resolve(&LottaWeb.UserResolver.update_profile/2)
    end

    field :update_password, type: :user do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsHisec)

      arg(:new_password, non_null(:string))

      resolve(&LottaWeb.UserResolver.update_password/2)
    end

    field :update_email, type: :user do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsHisec)

      arg(:new_email, non_null(:string))

      resolve(&LottaWeb.UserResolver.update_email/2)
    end

    field :register_device, type: :device do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:device, non_null(:register_device_input))

      resolve(&LottaWeb.UserDeviceResolver.register_device/2)
    end

    field :update_device, type: :device do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))
      arg(:device, non_null(:update_device_input))

      resolve(&LottaWeb.UserDeviceResolver.update_device/2)
    end

    field :delete_device, type: :device do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.UserDeviceResolver.delete_device/2)
    end

    field :destroy_account, type: :user do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:user_id, non_null(:id))
      arg(:transfer_file_ids, list_of(non_null(:id)))

      resolve(&LottaWeb.UserResolver.destroy_account/2)
    end

    field :create_user_group, type: :user_group do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:group, non_null(:user_group_input))

      resolve(&LottaWeb.UserGroupResolver.create/2)
    end

    field :update_user_group, type: :user_group do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))
      arg(:group, non_null(:user_group_input))

      resolve(&LottaWeb.UserGroupResolver.update/2)
    end

    field :delete_user_group, type: :delete_user_group_result do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.UserGroupResolver.delete/2)
    end

    field :request_password_reset, type: :boolean do
      arg(:email, non_null(:string))

      resolve(&LottaWeb.UserResolver.request_password_reset/2)
    end

    field :reset_password, type: :authresult do
      arg(:email, non_null(:string))
      arg(:token, non_null(:string))
      arg(:password, non_null(:string))

      resolve(&LottaWeb.UserResolver.reset_password/2)
      middleware(LottaWeb.Schema.Middleware.WriteTokensToContext)
    end

    field :update_user, type: :user do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAdministrator)

      arg(:id, non_null(:id))
      arg(:groups, list_of(non_null(:select_user_group_input)))

      resolve(&LottaWeb.UserResolver.update/2)
    end

    field :create_directory, type: :directory do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:name, non_null(:string))
      arg(:parent_directory_id, :id)
      arg(:is_public, :boolean)

      resolve(&LottaWeb.DirectoryResolver.create/2)
    end

    field :update_directory, type: :directory do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))
      arg(:name, :string)
      arg(:parent_directory_id, :id)

      resolve(&LottaWeb.DirectoryResolver.update/2)
    end

    field :delete_directory, type: :directory do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.DirectoryResolver.delete/2)
    end

    field :upload_file, type: :file do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:file, non_null(:upload))
      arg(:parent_directory_id, non_null(:id))

      resolve(&LottaWeb.FileResolver.upload/2)
    end

    field :delete_file, type: :file do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))

      resolve(&LottaWeb.FileResolver.delete/2)
    end

    field :update_file, type: :file do
      middleware(LottaWeb.Schema.Middleware.EnsureUserIsAuthenticated)

      arg(:id, non_null(:id))
      arg(:parent_directory_id, :id)
      arg(:filename, :string)

      resolve(&LottaWeb.FileResolver.update/2)
    end
  end
end
