defmodule LottaWeb.ArticleReactionResolver do
  @moduledoc false

  import Ecto.Query
  import Absinthe.Resolution.Helpers, only: [batch: 3]

  alias Lotta.Content
  alias Lotta.Accounts.User
  alias Lotta.Content.{Article, ArticleReaction}
  alias Lotta.Repo

  def resolve_article_reaction_counts(_args, %{
        context: %{},
        source: %Article{id: article_id} = article
      }) do
    # One grouped query for the reaction counts of all articles in the response.
    # Batch functions run in another process, so the tenant prefix is passed
    # along explicitly instead of relying on the process dictionary.
    prefix = Ecto.get_meta(article, :prefix) || Repo.get_prefix()

    batch({__MODULE__, :reaction_counts_by_article, prefix}, article_id, fn counts ->
      {:ok, Map.get(counts, article_id, [])}
    end)
  end

  @doc false
  def reaction_counts_by_article(prefix, article_ids) do
    from(ar in ArticleReaction,
      where: ar.article_id in ^Enum.uniq(article_ids),
      select: {ar.article_id, %{type: ar.type, count: count(ar.type)}},
      group_by: [ar.article_id, ar.type],
      order_by: [ar.article_id, ar.type]
    )
    |> Repo.all(prefix: prefix)
    |> Enum.group_by(&elem(&1, 0), &elem(&1, 1))
  end

  def react_to_article(%{article_id: article_id, type: type}, %{
        context: %{current_user: current_user}
      }) do
    article = Content.get_article(article_id)

    if is_nil(article) do
      {:error, "Beitrag nicht gefunden."}
    else
      case Content.create_article_reaction(article, current_user, type) do
        {:ok, _reaction} ->
          {:ok, article}

        error ->
          error
      end
    end
  end

  def get_reaction_users(%{id: article_id, type: type}, _info) do
    type = String.upcase(type)
    article = Content.get_article(article_id)

    if is_nil(article) do
      {:error, "Beitrag nicht gefunden."}
    else
      from(u in User,
        join: ar in ArticleReaction,
        on: ar.user_id == u.id,
        where: ar.article_id == ^article_id and ar.type == ^type
      )
      |> Repo.all()
      |> then(&{:ok, &1})
    end
  end
end
