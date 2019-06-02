defmodule ApiWeb.Schema.Types do
  import Absinthe.Resolution.Helpers, only: [dataloader: 1]
  use Absinthe.Schema.Notation
  
  object :authresult do
    field :user, :user
    field :token, :string
  end

  object :user do
    field :id, :id
    field :name, :string
    field :email, :string
    field :articles, list_of(:article), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Content)
  end

  object :tenant do
    field :id, :id
    field :title, :string
    field :slug, :string
    field :categories, list_of(:category), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
  end

  object :category do
    field :id, :id
    field :title, :string
    field :category_id, :id
    field :category, :category, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
    field :articles, list_of(:article), resolve: Absinthe.Resolution.Helpers.dataloader(Api.Content)
  end

  object :article do
    field :id, :id
    field :title, :string
    field :preview, :string
    field :preview_image_url, :string
    field :page_name, :string
    field :user, :user, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Accounts.User)
    field :category, :category, resolve: Absinthe.Resolution.Helpers.dataloader(Api.Tenants)
  end
end