defmodule ApiWeb.SearchResolver do
  @moduledoc false

  alias ApiWeb.Context
  alias Api.Elasticsearch.Search
  alias Api.Content.Article
  alias Api.Repo

  def search(%{search_text: search_text}, %{
        context: %Context{current_user: current_user}
      }) do
    {:ok,
     current_user
     |> Article.get_released_articles_query()
     |> Search.search_query_filter(search_text)
     |> Repo.all()
     |> Enum.uniq_by(& &1.id)}
  end
end
