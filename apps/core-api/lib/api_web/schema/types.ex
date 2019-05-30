defmodule ApiWeb.Schema.Types do
  use Absinthe.Schema.Notation
  use Absinthe.Ecto, repo: Api.Repo

  object :authresult do
    field :user, :user
    field :token, :string
  end

  object :user do
    field :id, :id
    field :name, :string
    field :email, :string
    field :articles, list_of(:article), resolve: assoc(:articles)
  end

  object :tenant do
    field :id, :id
    field :title, :string
    field :slug, :string
    field :categories, list_of(:category), resolve: assoc(:categories)
  end

  object :category do
    field :id, :id
    field :title, :string
    field :category_id, :id
  end

  object :article do
    field :id, :id
    field :title, :string
    field :preview, :string
    field :user, :user, resolve: assoc(:user)
  end
end