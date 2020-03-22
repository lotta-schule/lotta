defmodule Api.ArticleResolver do
  use Api.ReadRepoAliaser
  alias Api.Content
  alias Api.Accounts.User

  def get(%{id: id}, %{context: %{tenant: tenant, current_user: current_user}}) do
    article = ReadRepo.preload(Content.get_article!(id), :tenant)
    if User.is_author?(current_user, article) || User.is_admin?(current_user, tenant) do
      {:ok, article}
    else
      case User.has_group_for_article?(current_user, article) do
        true -> {:ok, article}
        _ -> {:error, "Du hast keine Rechte diesen Beitrag anzusehen."}
      end
    end
  end
  def get(%{id: id}, _info) do
    article = ReadRepo.preload(Content.get_article!(id), :groups)
    case article.groups do
      [] ->
        {:ok, article}
      _ ->
        {:error, "Du hast keine Rechte diesen Beitrag anzusehen."}
    end
  end
  def get(_args, _info), do: {:error, "Artikel nicht gefunden."}

  def get_topics(_args, %{context: %{tenant: tenant} = context}) do
    {:ok, Content.get_topics(tenant, context[:current_user], context[:user_group_ids], context[:user_is_admin])}
  end

  def all(%{category_id: category_id} = args, %{context: %{current_user: current_user, tenant: tenant} = context}) do
    {:ok, Content.list_articles(tenant, category_id, current_user, context[:user_group_ids], context[:user_is_admin], args[:filter])}
  end
  def all(args, %{context: %{current_user: current_user, tenant: tenant} = context}) do
    {:ok, Content.list_articles(tenant, nil, current_user, context[:user_group_ids], context[:user_is_admin], args[:filter])}
  end
  def all(%{category_id: category_id} = args, %{context: %{tenant: tenant}}) do
    {:ok, Content.list_articles(tenant, category_id, nil, [], false, args[:filter])}
  end
  def all(args, %{context: %{tenant: tenant}}) do
    {:ok, Content.list_articles(tenant, nil, nil, [], false, args[:filter])}
  end
  def all(_args, _info) do
    {:error, "Tenant nicht gefunden."}
  end
  
  def all_unpublished(_args, %{context: %{tenant: tenant} = context}) do
    case context[:current_user] && context[:user_is_admin] do
      true ->
        {:ok, Content.list_unpublished_articles(tenant)}
      _ ->
        {:error, "Nur Administratoren dürfen unveröffentlichte Beiträge abrufen."}
    end
  end
  def all_unpublished(_args, _info) do
    {:error, "Tenant nicht gefunden."}
  end
  
  def own(_args, %{context: %{current_user: current_user, tenant: tenant}}) do
      {:ok, Content.list_user_articles(tenant, current_user)}
  end
  def own(_args, %{context: %{tenant: _tenant}}) do
    {:error, "Nur angemeldete Nutzer können eigene Beiträge abrufen."}
  end
  def own(_args, _info) do
    {:error, "Tenant nicht gefunden."}
  end

  def by_topic(%{topic: topic}, %{context: %{tenant: tenant} = context}) do
    {:ok, Content.list_articles_by_topic(tenant, context[:current_user], context[:user_group_ids], context[:user_is_admin], topic)}
  end
  def by_topic(_args, _info) do
    {:error, "Tenant nicht gefunden."}
  end

  def create(%{article: article_input}, %{context: %{tenant: tenant} = context}) do
    case context[:current_user] do
      nil ->
        {:error, "Nur angemeldete Nutzer können Beiträge erstellen."}
      user ->
        article_input
        |> Content.create_article(tenant, user)
    end
  end

  def update(%{id: id, article: article_input}, %{context: %{tenant: tenant} = context}) do
    article = Content.get_article!(id)
    if context[:current_user] && (context[:user_is_admin] || User.is_author?(context[:current_user], article)) do
      article
      |> Content.update_article(article_input)
    else
      {:error, "Nur Administratoren oder Autoren dürfen Artikel bearbeiten."}
    end
  end
  
  def delete(%{id: id}, %{context: %{tenant: tenant} = context}) do
    article = Content.get_article!(id)
    if context[:current_user] && (context[:user_is_admin] || User.is_author?(context[:current_user], article)) do
      article
      |> Content.delete_article()
    else
      {:error, "Nur Administratoren oder Autoren dürfen Artikel löschen."}
    end
  end

  def toggle_pin(%{id: article_id}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && context[:user_is_admin] do
      Content.toggle_article_pin(article_id)
    else
      {:error, "Nur Administratoren dürfen Beiträge anpinnen."}
    end
  end
end