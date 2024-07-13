defmodule Lotta.Content.ArticleReaction do
  @moduledoc false

  use Ecto.Schema
  import Ecto.Changeset

  @timestamps_opts [type: :utc_datetime]

  schema "article_reactions" do
    field :type, :string

    belongs_to :article, Article
    belongs_to :user, User

    timestamps()
  end

  def changeset(reaction, attrs) do
    reaction
    |> cast(attrs, [
      :type,
      :article_id,
      :user_id
    ])
    |> validate_required([:type, :article_id, :user_id])
  end
end
