defmodule Api.Content.ContentModule do
  use Ecto.Schema
  import Ecto.Changeset

  schema "content_modules" do
    field :text, :string
    field :type, :string

    belongs_to :article, Api.Content.Article

    timestamps()
  end

  @doc false
  def changeset(content_module, attrs) do
    content_module
    |> cast(attrs, [:type, :text])
    |> validate_required([:type, :text])
  end
end
