defmodule Lotta.Search do
  @moduledoc """
    Module for executing a search request.
  """
  require Logger

  import Ecto.Query

  alias Lotta.Content.ContentModule
  alias Lotta.Tenants.Category

  @doc """
  Executes a fulltext search for a given search query in
  a given teannt.
  Returns a query selecting the search results.

  ## Example

    iex> tenant = Tenants.get_tenant_by_prefix("tenant_1")
    iex> Repo.all(
      search_query_filter(Article, tenant, "Search")
    )
    [%Article{}]

  """
  @spec filter_articles_search_query(
          initial_query :: Ecto.Queryable.t(),
          searchtext :: String.t()
        ) ::
          Ecto.Queryable.t() | {:error, term()}

  def filter_articles_search_query(query, searchtext) do
    from(a in query,
      join: cm in ContentModule,
      on: cm.article_id == a.id,
      select_merge: %{
        rank:
          selected_as(
            fragment(
              """
                  coalesce((ts_rank(?.search, websearch_to_tsquery('german', ?))) +
                  coalesce(avg(ts_rank(?.search, websearch_to_tsquery('german', ?)))), 0) -
                  ((date_part('year', now()) - date_part('year', ?.updated_at)) * 0.033)
              """,
              a,
              ^searchtext,
              cm,
              ^searchtext,
              a
            ),
            :rank
          )
      },
      group_by: [a.id],
      order_by: [desc: selected_as(:rank)],
      where:
        fragment("?.search @@ websearch_to_tsquery('german', ?)", a, ^searchtext) or
          fragment("?.search @@ websearch_to_tsquery('german', ?)", cm, ^searchtext)
    )
  end
end
