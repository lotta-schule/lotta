defmodule LottaWeb.SearchResolver do
  @moduledoc false

  alias LottaWeb.Context
  alias Lotta.Search
  alias Lotta.Content.Article
  alias Lotta.Repo

  def search(%{search_text: searchtext} = args, %{
        context: %Context{current_user: current_user}
      }) do
    filter_options =
      args
      |> Map.get(:options, %{})
      |> Enum.map(& &1)

    Article.get_published_articles_query(
      current_user,
      filter_options
    )
    |> Search.filter_articles_search_query(searchtext)
    |> Repo.all()
    |> then(&{:ok, &1})
  end
end
