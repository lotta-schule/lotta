defmodule Api.ArticleResolver do
  alias Api.Content

  def get(%{id: id}, %{context: %{context: %{tenant: tenant}}}) do
    {:ok, Content.get_article!(id)}
  end
  def get(_args, _info) do
    {:error, "Tenant nicht gefunden."}
  end

  def all(%{category_id: category_id}, %{context: %{context: %{tenant: tenant}}}) do
    {:ok, Content.list_articles(tenant.id, category_id)}
  end
  def all(_args, %{context: %{context: %{tenant: tenant}}}) do
    {:ok, Content.list_articles(tenant.id)}
  end
  def all(_args, _info) do
    {:error, "Tenant nicht gefunden."}
  end

  def by_page(%{name: name}, %{context: %{context: %{tenant: tenant}}}) do
    {:ok, Content.list_articles_by_page(tenant.id, name)}
  end
  def by_page(_args, _info) do
    {:error, "Tenant nicht gefunden."}
  end

  def update(%{id: id, article: article_params}, _info) do
    Content.get_article!(id)
    |> Content.update_article(article_params)
  end
end