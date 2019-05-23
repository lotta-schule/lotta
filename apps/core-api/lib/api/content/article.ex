defmodule Api.Content.Article do
  use Ecto.Schema
  import Ecto.Changeset

  schema "articles" do
    field :pageName, :string
    field :preview, :string
    field :title, :string
    field :user_id, :id

    timestamps()
  end

  @doc false
  def changeset(article, attrs) do
    article
    |> cast(attrs, [:title, :preview, :pageName])
    |> validate_required([:title, :preview, :pageName])
  end
end
