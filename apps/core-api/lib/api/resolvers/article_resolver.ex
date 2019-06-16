defmodule Api.ArticleResolver do
  alias Api.Content

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
end