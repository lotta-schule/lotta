defmodule LottaWeb.SearchResolver do
  @moduledoc false

  import Ecto.Query

  alias LottaWeb.Context
  alias Lotta.Search
  alias Lotta.Content.Article
  alias Lotta.Repo

  def search(%{search_text: searchtext} = args, %{
        context: %Context{current_user: current_user, tenant: t}
      }) do
    {:ok,
     from(a in Article, where: a.id in ^[3240, 3239, 1312, 249, 248, 2548])
     |> Repo.all()}

    current_user
    |> Article.get_published_articles_query()
    |> Search.filter_articles_search_query(
      t,
      searchtext,
      construct_options(args[:options])
    )
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

  defp construct_options(nil), do: construct_options(%{})

  defp construct_options(options) when is_map(options) do
    options
    |> Map.update(
      :category_id,
      nil,
      &if(is_binary(&1) and byte_size(&1) > 0, do: String.to_integer(&1))
    )
    |> Map.put(:published, true)
    |> Map.to_list()
  end
end
