defmodule Api.ArticleResolver do
  alias Api.Content
  alias Api.Accounts.User
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
  
  def all_unpublished(_args, %{context: %{context: %{ current_user: current_user, tenant: tenant }}}) do
    if User.is_admin?(current_user, tenant) do
      {:ok, Content.list_unpublished_articles(tenant)}
    else
      {:error, "Nur Administratoren dürfen unveröffentlichte Beiträge abrufen"}
    end
  end
  def all_unpublished(_args, _info) do
    {:error, "Tenant nicht gefunden."}
  end
  
  def own(_args, %{context: %{context: %{ current_user: current_user, tenant: tenant }}}) do
      {:ok, Content.list_user_articles(tenant, current_user)}
  end
  def own(_args, _info) do
    {:error, "Tenant nicht gefunden."}
  end

  def by_topic(%{topic: topic}, %{context: %{context: %{tenant: tenant}}}) do
    {:ok, Content.list_articles_by_topic(tenant.id, topic)}
  end
  def by_topic(_args, _info) do
    {:error, "Tenant nicht gefunden."}
  end

  def create(%{article: article_input}, %{context: %{context: %{ current_user: current_user, tenant: tenant }}}) do
    article_input
    |> Map.put(:users, [Map.put(current_user, :id, current_user.id)])
    |> Map.put(:tenant_id, tenant.id)
    |> Content.create_article
  end

  def update(%{id: id, article: article_input}, %{context: %{context: %{ current_user: current_user, tenant: tenant }}}) do
    Content.get_article!(id)
    |> Content.update_article(article_input)
  end

  def toggle_pin(%{id: article_id}, %{context: %{context: %{ current_user: current_user, tenant: tenant }}}) do
    if User.is_admin?(current_user, tenant) do
      Content.toggle_article_pin(article_id)
    else
      {:error, "Nur Administratoren dürfen Beiträge anpinnen."}
    end
  end
end