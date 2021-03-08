defmodule ApiWeb.SearchResolver do
  @moduledoc false

  alias ApiWeb.Context
  alias Api.Elasticsearch.Search
  alias Api.Content.Article
  alias Api.Repo

  def search(%{search_text: searchtext} = args, %{
        context: %Context{current_user: current_user}
      }) do
    current_user
    |> Article.get_published_articles_query()
    |> Search.search_query_filter(searchtext, args[:options])
    |> case do
      {:error, msg} ->
        {:error, msg}

      query ->
        {:ok,
         query
         |> Repo.all()
         |> Enum.uniq_by(& &1.id)}
    end
  end
end
