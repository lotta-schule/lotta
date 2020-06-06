defmodule Api.Elasticsearch.Search do
  @moduledoc """
    Module for executing an elastic search request
  """

  alias Api.Tenants.Tenant
  import Ecto.Query

  def search_query_filter(query, searchtext, %Tenant{} = tenant) do
    case execute_search(searchtext, tenant) do
      {:ok, result} ->
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

      error ->
        error
    end
  end

  defp execute_search(searchtext, %Tenant{} = tenant) do
    Elasticsearch.post(
      Api.Elasticsearch.Cluster,
      "/articles/_doc/_search",
      %{
        "from" => 0,
        "size" => 15,
        "query" => %{
          "bool" => %{
            "should" => [
              %{
                "match" => %{
                  "title" => %{
                    "query" => searchtext,
                    "boost" => 3,
                    "fuzziness" => "auto"
                  }
                }
              },
              %{
                "match" => %{
                  "title.keyword" => %{
                    "query" => searchtext,
                    "boost" => 4,
                    "fuzziness" => "auto"
                  }
                }
              },
              %{
                "match" => %{
                  "preview" => %{
                    "query" => searchtext,
                    "fuzziness" => "auto"
                  }
                }
              },
              %{
                "match" => %{
                  "topic" => %{
                    "query" => searchtext,
                    "boost" => 2,
                    "fuzziness" => "auto"
                  }
                }
              },
              %{
                "nested" => %{
                  "path" => "content_modules",
                  "query" => %{
                    "match" => %{
                      "content_modules.content" => %{
                        "query" => searchtext,
                        "fuzziness" => "auto"
                      }
                    }
                  }
                }
              }
            ],
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
