defmodule Api.ArticleResolver do
  alias Api.Content
  alias Api.Accounts.User
  alias Api.Repo

  def get(%{id: id}, %{context: %{context: %{current_user: current_user}}}) do
    article = Content.get_article!(id) |> Repo.preload(:tenant)
    if User.is_author?(current_user, article) do
      {:ok, article}
    else
      case User.has_group_for_article?(current_user, article) do
        true -> {:ok, article}
        _ -> {:error, "Du hast keine Rechte diesen Beitrag anzusehen."}
      end
    end
  end
  def get(%{id: id}, _info) do
    article = Content.get_article!(id) |> Repo.preload(:group)
    case is_nil(article.group) do
      true -> {:ok, article}
      _ -> {:error, "Du hast keine Rechte diesen Beitrag anzusehen"}
    end
  end
  def get(_args, _info), do: {:error, "Artikel nicht gefunden."}

  def all(%{category_id: category_id}, %{context: %{context: %{ current_user: current_user, tenant: tenant }}}) do
    {:ok, Content.list_articles(tenant.id, category_id, current_user)}
  end
  def all(_args, %{context: %{context: %{ current_user: current_user, tenant: tenant }}}) do
    {:ok, Content.list_articles(tenant.id, nil, current_user)}
  end
  def all(%{category_id: category_id}, %{context: %{context: %{ tenant: tenant }}}) do
    {:ok, Content.list_articles(tenant.id, category_id, nil)}
  end
  def all(_args, %{context: %{context: %{ tenant: tenant }}}) do
    {:ok, Content.list_articles(tenant.id, nil, nil)}
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
    |> Content.create_article(tenant, current_user)
  end

  def update(%{id: id, article: article_input}, %{context: %{context: %{ current_user: current_user, tenant: tenant }}}) do
    article = Content.get_article!(id)
    if User.is_admin?(current_user, tenant) || User.is_author?(current_user, article) do
      article
      |> Content.update_article(article_input)
    else
      {:error, "Nur Administratoren oder Autoren dürfen Artikel bearbeiten."}
    end
  end

  def toggle_pin(%{id: article_id}, %{context: %{context: %{ current_user: current_user, tenant: tenant }}}) do
    if User.is_admin?(current_user, tenant) do
      Content.toggle_article_pin(article_id)
    else
      {:error, "Nur Administratoren dürfen Beiträge anpinnen."}
    end
  end
end