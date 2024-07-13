defmodule LottaWeb.ArticleReactionResolver do
  @moduledoc false

  import Ecto.Query

  alias Lotta.Content
  alias LottaWeb.Context
  alias Lotta.Content.{Article, ArticleReaction}
  alias Lotta.Repo

  def resolve_article_reaction_counts(_args, %{
        context: %{},
        source: %Article{id: article_id}
      }) do
    from(ar in ArticleReaction,
      where: ar.article_id == ^article_id,
      select: %{type: ar.type, count: count(ar.type)},
      group_by: [ar.type]
    )
    |> Repo.all()
    |> then(&{:ok, &1})
  end

  def react_to_article(%{article_id: article_id, type: type}, %{
        context: %Context{current_user: current_user}
      }) do
    article = Content.get_article(article_id)

    if is_nil(article) do
      {:error, "Beitrag nicht gefunden."}
    else
      with {:ok, _reaction} = result <-
             Content.create_article_reaction(article, current_user, type) do
        {:ok, article}
        |> IO.inspect(label: "result")
      else
        error ->
          error
      end
    end
  end
end
