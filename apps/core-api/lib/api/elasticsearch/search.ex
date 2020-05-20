defmodule Api.Elasticsearch.Search do
  alias Api.Tenants.Tenant
  import Ecto.Query
  use Api.ReadRepoAliaser

  def search_query_filter(query, searchtext, %Tenant{} = tenant) do
    with {:ok, result} <- execute_search(searchtext, tenant) do
      query =
        query
        |> exclude(:order_by)
        |> exclude(:distinct)
      ids =
        result["hits"]["hits"]
        |> Enum.map(&String.to_integer(&1["_id"]))
      from a in query,
        where: a.id in ^ids,
        order_by: fragment("array_position(?, ?)", ^ids, a.id)
    else
      error ->
        error
    end
  end

  defp execute_search(searchtext, %Tenant{} = tenant) do
    Elasticsearch.post(Api.Elasticsearch.Cluster,
      "/articles/_doc/_search",
      %{
        "query" => %{
          "bool" => %{
            "must" => %{
              "multi_match" => %{
                "query" => searchtext,
                "fields" => [
                  "title^3",
                  "title.keyword^4",
                  "preview",
                  "topic^2",
                  "authors.email",
                  "authors.name",
                  "authors.email",
                  "content_module.content"
                ],
                "fuzziness" => "auto"
              }
            },
            "filter" => %{
              "term" => %{
                "tenant_id" => tenant.id
              }
            }
          }
        }
      }
    )
  end
end
