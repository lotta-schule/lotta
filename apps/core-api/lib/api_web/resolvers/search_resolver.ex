defmodule ApiWeb.SearchResolver do
  @moduledoc false

  alias Api.Elasticsearch.Search
  alias Api.Content
  alias Api.Repo

  def search(%{search_text: search_text}, %{
        context: %{current_user: current_user, is_admin: is_admin, all_groups: groups}
      }) do
    articles =
      Content.list_public_articles(
        current_user,
        groups,
        is_admin
      )
      |> Search.search_query_filter(search_text)
      |> Repo.all()
      |> Enum.uniq_by(& &1.id)

    {:ok, articles}
  end
end
