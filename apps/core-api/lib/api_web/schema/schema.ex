defmodule ApiWeb.Schema do
  use Absinthe.Schema
  import_types ApiWeb.Schema.Types

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

    field :articles, list_of(:article) do
      resolve &Api.ArticleResolver.all/2
    end

    field :users, list_of(:user) do
      resolve &Api.UserResolver.all/2
    end

    field :user, type: :user do
      arg :id, non_null(:id)
      resolve &Api.UserResolver.find/2
    end
  end

  input_object :update_user_params do
    field :name, :string
    field :email, :string
    field :password, :string
  end

  mutation do
    field :register, type: :authresult do
      arg :user, :update_user_params

      resolve &Api.UserResolver.register/2
    end

    field :login, type: :authresult do
      arg :username, :string
      arg :password, :string

      resolve &Api.UserResolver.login/2
    end

    field :update_user, type: :user do
      arg :id, non_null(:integer)
      arg :user, :update_user_params

      resolve &Api.UserResolver.update/2
    end
  end

  def context(ctx) do
    loader =
      Dataloader.new
      |> Dataloader.add_source(Api.Content, Api.Content.data())
      |> Dataloader.add_source(Api.Tenants, Api.Tenants.data())
      # |> Dataloader.add_source(Api.Tenants.Category, Api.Tenants.data())
      |> Dataloader.add_source(Api.Accounts, Api.Accounts.data())

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end
end