defmodule ApiWeb.Schema do
  use Absinthe.Schema
  import_types ApiWeb.Schema.Types
  import_types Absinthe.Plug.Types

  query do
    field :tenants, list_of(:tenant) do
      resolve &Api.TenantResolver.all/2
    end

    field :tenant, :tenant do
      resolve &Api.TenantResolver.current/2
    end
    
    field :categories, list_of(:category) do
      resolve &Api.CategoryResolver.all/2
    end

    field :article, :article do
      arg :id, non_null(:id)
      resolve &Api.ArticleResolver.get/2
    end

    field :articles, list_of(:article) do
      arg :category_id, :id
      resolve &Api.ArticleResolver.all/2
    end

    field :topic, list_of(:article) do
      arg :topic, non_null(:string)
      resolve &Api.ArticleResolver.by_topic/2
    end

    field :users, list_of(:user) do
      resolve &Api.UserResolver.all_with_groups/2
    end

    field :search_users, list_of(:user) do
      arg :searchtext, non_null(:string)
      resolve &Api.UserResolver.find/2
    end

    field :user, type: :user do
      arg :id, :id
      resolve &Api.UserResolver.get/2
    end

    field :files, list_of(:file) do
      resolve &Api.FileResolver.all/2
    end
  end

  mutation do
    field :register, type: :authresult do
      arg :user, non_null(:update_user_params)

      resolve &Api.UserResolver.register/2
    end

    field :login, type: :authresult do
      arg :username, :string
      arg :password, :string

      resolve &Api.UserResolver.login/2
    end

    field :update_user, type: :user do
      arg :id, non_null(:id)
      arg :user, non_null(:update_user_params)

      resolve &Api.UserResolver.update/2
    end

    field :assign_user_to_group, type: :user do
      arg :id, non_null(:id)
      arg :group_id, non_null(:id)
      resolve &Api.UserResolver.assign_user/2
    end
    
    field :create_article, type: :article do
      arg :article, non_null(:article_input)
  
      resolve &Api.ArticleResolver.create/2
    end
    
    field :update_article, type: :article do
      arg :id, non_null(:id)
      arg :article, non_null(:article_input)
  
      resolve &Api.ArticleResolver.update/2
    end

    field :upload_file, type: :file do
      arg :path, :string, default_value: "/"
      arg :file, non_null(:upload)

      resolve &Api.FileResolver.upload/2
    end

  end

  input_object :update_user_params do
    field :name, :string
    field :email, :string
    field :password, :string
  end
  
  input_object :article_input do
    field :inserted_at, :naive_datetime
    field :title, non_null(:string)
    field :category, :category
    field :preview, :string
    field :preview_image_file, :file
    field :topic, :string
    field :content_modules, list_of(:content_module_input)
  end
  
  input_object :content_module_input do
    field :type, :content_module_type, default_value: "text"
    field :text, :string
    field :files, list_of(:file)
    field :sort_key, :integer
    field :configuration, :json
  end

  def context(ctx) do
    loader =
      Dataloader.new
      |> Dataloader.add_source(Api.Content, Api.Content.data())
      |> Dataloader.add_source(Api.Tenants, Api.Tenants.data())
      |> Dataloader.add_source(Api.Accounts, Api.Accounts.data())

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end
end