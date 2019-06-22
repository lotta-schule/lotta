defmodule Api.ArticleResolver do
  alias Api.Content
  alias Repo

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

  def create(%{article: create_article_input}, %{context: %{context: %{ current_user: current_user, tenant: tenant }}}) do
    create_article_input
    |> Map.put(:user_id, current_user.id)
    |> Content.create_article
  end

  def update(%{id: id, article: update_article_input}, _info) do
    Content.get_article!(id)
    |> Content.update_article(update_article_input)
  end
end