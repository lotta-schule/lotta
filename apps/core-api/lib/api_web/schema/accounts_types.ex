defmodule ApiWeb.Schema.AccountsTypes do
  use Absinthe.Schema.Notation

  object :accounts_queries do
    field :current_user, :user do
      resolve &Api.UserResolver.get_current/2
    end

    field :users, list_of(:user) do
      resolve &Api.UserResolver.all_with_groups/2
    end

    field :search_users, list_of(:user) do
      arg :searchtext, non_null(:string)
      resolve &Api.UserResolver.find/2
    end

    field :user, type: :user do
      arg :id, :lotta_id
      resolve &Api.UserResolver.get/2
    end

    field :files, list_of(:file) do
      resolve &Api.FileResolver.all/2
    end
  end

  object :accounts_mutations do
    field :register, type: :authresult do
      arg :user, non_null(:register_user_params)
      arg :group_key, :string

      resolve &Api.UserResolver.register/2
    end

    field :login, type: :authresult do
      arg :username, :string
      arg :password, :string

      resolve &Api.UserResolver.login/2
    end

    field :update_profile, type: :user do
      arg :user, non_null(:update_user_params)

      resolve &Api.UserResolver.update_profile/2
    end

    field :assign_user_to_group, type: :user do
      arg :id, non_null(:lotta_id)
      arg :group_id, non_null(:lotta_id)
      resolve &Api.UserResolver.assign_user/2
    end

    field :upload_file, type: :file do
      arg :path, :string, default_value: "/"
      arg :file, non_null(:upload)

      resolve &Api.FileResolver.upload/2
    end

    field :move_file, type: :file do
      arg :id, non_null(:lotta_id)
      arg :path, non_null(:string)

      resolve &Api.FileResolver.move/2
    end
    
    field :delete_file, type: :file do
      arg :id, non_null(:lotta_id)

      resolve &Api.FileResolver.delete/2
    end
  end

  input_object :register_user_params do
    field :name, :string
    field :email, :string
    field :password, :string
  end
  
  input_object :update_user_params do
    field :name, :string
    field :email, :string
    field :class, :string
    field :nickname, :string
    field :avatar_image_file, :file
  end

  object :authresult do
    field :user, :user
    field :token, :string
  end

  object :user do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :last_seen, :naive_datetime
    field :name, :string
    field :class, :string
    field :nickname, :string
    field :email, :string
    field :avatar_image_file, :file, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
    field :articles, list_of(:article), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Content)
    field :groups, list_of(:user_group), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts)
  end

  object :user_group do
    field :id, :lotta_id
    field :inserted_at, :naive_datetime
    field :updated_at, :naive_datetime
    field :name, :string
    field :priority, :integer
    field :is_admin_group, :boolean
    field :tenant, :tenant, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
  end
  
end