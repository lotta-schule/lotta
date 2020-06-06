defmodule Api.SearchResolver do
  alias Api.Elasticsearch.Search
  alias Api.Content
  alias Api.Repo

  def search(%{search_text: search_text}, %{context: %{tenant: tenant} = context}) do
    articles =
      Content.list_public_articles(
        tenant,
        context[:current_user],
        context[:user_group_ids],
        context[:user_is_admin]
      )
      |> Search.search_query_filter(search_text, tenant)
      |> Repo.all()
      |> Enum.uniq_by(& &1.id)

    {:ok, articles}
  end
end
