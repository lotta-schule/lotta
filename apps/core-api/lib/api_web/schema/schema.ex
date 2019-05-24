defmodule ApiWeb.Schema do
  use Absinthe.Schema
  import_types ApiWeb.Schema.Types

  query do
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

    field :update_user, type: :user do
      arg :id, non_null(:integer)
      arg :user, :update_user_params

      resolve &Api.UserResolver.update/2
    end
  end
end