defmodule Lotta.Search do
  @moduledoc """
    Module for executing an elastic search request.
  """
  require Logger

  import Ecto.Query
  import Elasticsearch

  alias Lotta.Elasticsearch.Cluster
  alias Lotta.Tenants.Tenant
  alias Lotta.Tenants.Category

  @type search_options :: [category_id: Category.id(), published: boolean()]

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
          tenant :: Tenant.t(),
          searchtext :: String.t(),
          ops :: search_options() | nil
        ) ::
          Ecto.Queryable.t() | {:error, term()}

  def filter_articles_search_query(query, tenant, searchtext, options \\ []) do
    case execute_search(searchtext, tenant, options) do
      {:ok, result} ->
        query =
          query
          |> exclude(:order_by)
          |> exclude(:distinct)

        ids =
          result["hits"]["hits"]
          |> Enum.map(fn hit ->
            hit
            |> Map.get("_id")
            |> String.split("--")
            |> List.last()
            |> String.to_integer()
          end)

        from(a in query,
          where: a.id in ^ids,
          order_by: fragment("array_position(?, ?)", ^ids, a.id)
        )
        |> put_query_prefix(tenant.prefix)

      {:error, %Elasticsearch.Exception{message: msg} = exception} ->
        Logger.error("Error executing search: #{inspect(exception)}")
        Sentry.capture_exception(exception)
        {:error, msg}
    end
  end

  defp execute_search(searchtext, tenant, opts) do
    payload =
      apply_search_options(
        default_search_query(searchtext, tenant),
        opts
      )

    post(Cluster, "/articles/_doc/_search", payload)
  end

  defp default_search_query(searchtext, tenant) do
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
                  "boost" => 3
                }
              }
            },
            %{
              "match" => %{
                "title.keyword" => %{
                  "query" => searchtext,
                  "boost" => 4
                }
              }
            },
            %{
              "match" => %{
                "preview" => %{
                  "query" => searchtext,
                  "boost" => 2
                }
              }
            },
            %{
              "match_phrase" => %{
                "tags" => %{
                  "query" => searchtext,
                  "boost" => 2
                }
              }
            },
            %{
              "nested" => %{
                "path" => "users",
                "query" => %{
                  "bool" => %{
                    "should" => [
                      %{
                        "match_phrase" => %{
                          "users.name" => %{
                            "query" => searchtext
                          }
                        }
                      },
                      %{
                        "match_phrase" => %{
                          "users.nickname" => %{
                            "query" => searchtext
                          }
                        }
                      }
                    ],
                    "minimum_should_match" => 1
                  }
                }
              }
            },
            %{
              "nested" => %{
                "path" => "content_modules",
                "query" => %{
                  "match" => %{
                    "content_modules.content" => %{
                      "query" => searchtext
                    }
                  }
                }
              }
            }
          ],
          "filter" => [
            %{
              "term" => %{
                "tenant_id" => tenant.id
              }
            }
          ],
          "minimum_should_match" => 1
        }
      }
    }
  end

  defp apply_search_options(query, search_options) do
    Enum.reduce(search_options, query, fn {key, val}, query ->
      apply_filter(query, key, val)
    end)
  end

  defp apply_filter(query, :category_id, id) when is_integer(id) do
    {_num_updates, query} =
      get_and_update_in(
        query,
        ["query", "bool", "filter"],
        &{&1, &1 ++ [%{"term" => %{"category_id" => id}}]}
      )

    query
  end

  defp apply_filter(query, :published, is_published) when is_boolean(is_published) do
    {_num_updates, query} =
      get_and_update_in(
        query,
        ["query", "bool", "filter"],
        &{&1, &1 ++ [%{"term" => %{"published" => is_published}}]}
      )

    query
  end

  defp apply_filter(query, _, _), do: query
end
