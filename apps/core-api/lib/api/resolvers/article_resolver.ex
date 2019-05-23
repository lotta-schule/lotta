defmodule Api.ArticleResolver do
  alias Api.Content

  def all(_args, _info) do
    {:ok, Content.list_articles()}
  end
end