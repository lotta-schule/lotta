defmodule Api.Elasticsearch.Search do
  @moduledoc """
    Module for executing an elastic search request
  """

  import Ecto.Query

  defmodule SearchOptions do
    @moduledoc false

    @type t :: %__MODULE__{category_id: String.t() | nil}

    defstruct category_id: nil

    def create(nil), do: %__MODULE__{}
    def create(fields), do: struct(__MODULE__, fields)
  end

  @spec search_query_filter(Ecto.Queryable.t(), String.t(), map()) ::
          Ecto.Queryable.t() | {:error, term()}

  def search_query_filter(query, searchtext, options) do
    case execute_search(searchtext, SearchOptions.create(options)) do
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

      {:error, %Elasticsearch.Exception{message: msg} = exception} ->
        Sentry.capture_exception(exception)
        {:error, msg}

      error ->
        error
    end
  end

  defp execute_search(searchtext, options) do
    Elasticsearch.post(
      Api.Elasticsearch.Cluster,
      "/#{Api.Elasticsearch.Cluster.get_prefixed_index("articles")}/_doc/_search",
      default_search_query(searchtext)
      |> apply_search_options(options)
    )
  end

  defp default_search_query(searchtext) do
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
  end

  defp apply_search_options(query, %SearchOptions{} = options) do
    case options do
      %{category_id: id} when not is_nil(id) ->
        query
        |> put_in(["query", "bool", "filter"], %{"match" => %{"category_id" => id}})

      _ ->
        query
    end
  end
end
