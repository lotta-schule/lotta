defmodule Api.Elasticsearch.Search do
  @moduledoc """
    Module for executing an elastic search request
  """

  import Ecto.Query

  def search_query_filter(query, searchtext) do
    case execute_search(searchtext) do
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

  defp execute_search(searchtext) do
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
                "match_phrase" => %{
                  "title" => %{
                    "query" => searchtext,
                    "boost" => 3
                  }
                }
              },
              %{
                "match_phrase" => %{
                  "title.keyword" => %{
                    "query" => searchtext,
                    "boost" => 4
                  }
                }
              },
              %{
                "match_phrase" => %{
                  "preview" => %{
                    "query" => searchtext
                  }
                }
              },
              %{
                "match_phrase" => %{
                  "topic" => %{
                    "query" => searchtext,
                    "boost" => 2
                  }
                }
              },
              %{
                "nested" => %{
                  "path" => "content_modules",
                  "query" => %{
                    "match_phrase" => %{
                      "content_modules.content" => %{
                        "query" => searchtext
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      }
    )
  end
end
