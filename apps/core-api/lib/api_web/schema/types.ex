defmodule ApiWeb.Schema.Types do
  use Absinthe.Schema.Notation
  use Absinthe.Ecto, repo: Api.Repo

  object :user do
    field :id, :id
    field :name, :string
    field :email, :string
    field :articles, list_of(:article), resolve: assoc(:articles)
  end

  object :article do
    field :id, :id
    field :title, :string
    field :preview, :string
    field :user, :user, resolve: assoc(:user)
  end
end