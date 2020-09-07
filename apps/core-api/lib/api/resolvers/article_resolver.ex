defmodule Api.ArticleResolver do
  @moduledoc """
    GraphQL Resolver Module for finding, creating, updating and deleting articles
  """

  import Api.Accounts.Permissions

  alias Api.Repo
  alias Api.Content

  def get(%{id: id}, %{context: %{current_user: current_user}}) do
    article = Content.get_article!(String.to_integer(id))

    if user_is_author?(current_user, article) || user_is_admin?(current_user) do
      {:ok, article}
    else
      case user_has_group_for_article?(current_user, article) do
        true -> {:ok, article}
        _ -> {:error, "Du hast keine Rechte diesen Beitrag anzusehen."}
      end
    end
  end

  def get(%{id: id}, _info) do
    article = Repo.preload(Content.get_article!(String.to_integer(id)), :groups)

    case article.groups do
      [] ->
        {:ok, article}

      _ ->
        {:error, "Du hast keine Rechte diesen Beitrag anzusehen."}
    end
  end

  def get(_args, _info), do: {:error, "Beitrag nicht gefunden."}

  def get_topics(_args, %{context: context}) do
    {:ok,
     Content.get_topics(
       context[:current_user],
       context[:user_group_ids],
       context[:user_is_admin]
     )}
  end

  def all(args, %{context: context}) do
    {:ok,
     Content.list_articles(
       if(is_nil(args[:category_id]), do: nil, else: String.to_integer(args[:category_id])),
       context[:current_user],
       context[:user_group_ids],
       context[:user_is_admin],
       args[:filter]
     )}
  end

  def all_unpublished(_args, %{context: context}) do
    case context[:current_user] && context[:user_is_admin] do
      true ->
        {:ok, Content.list_unpublished_articles()}

      _ ->
        {:error, "Nur Administratoren dürfen unveröffentlichte Beiträge abrufen."}
    end
  end

  def own(_args, %{context: %{current_user: current_user}}) do
    {:ok, Content.list_user_articles(current_user)}
  end

  def own(_args, _info) do
    {:error, "Nur angemeldete Nutzer können eigene Beiträge abrufen."}
  end

  def by_topic(%{topic: topic}, %{context: context}) do
    {:ok,
     Content.list_articles_by_topic(
       context[:current_user],
       context[:user_group_ids],
       context[:user_is_admin],
       topic
     )}
  end

  def create(%{article: article_input}, %{context: context}) do
    case context[:current_user] do
      nil ->
        {:error, "Nur angemeldete Nutzer können Beiträge erstellen."}

      user ->
        article_input
        |> Content.create_article(user)
    end
  end

  def update(%{id: id, article: article_input}, %{context: context}) do
    article = Content.get_article!(String.to_integer(id))

    cond do
      is_nil(context[:current_user]) ->
        {:error, "Du musst angemeldet sein um Beiträge zu bearbeiten."}

      !user_is_admin?(context.current_user) &&
          !user_is_author?(context.current_user, article) ->
        {:error, "Nur Administratoren oder Autoren dürfen Beiträge bearbeiten."}

      true ->
        article
        |> Content.update_article(article_input)
    end
  end

  def delete(%{id: id}, %{context: context}) do
    article = Content.get_article!(String.to_integer(id))

    cond do
      is_nil(context[:current_user]) ->
        {:error, "Du musst angemeldet sein um Beiträge zu löschen."}

      !user_is_admin?(context.current_user) && !user_is_author?(context.current_user, article) ->
        {:error, "Nur Administratoren oder Autoren dürfen Beiträge löschen."}

      true ->
        article
        |> Content.delete_article()
    end
  end

  def toggle_pin(%{id: article_id}, %{context: %{current_user: current_user}}) do
    case user_is_admin?(current_user) do
      true ->
        Content.toggle_article_pin(String.to_integer(article_id))

      false ->
        {:error, "Nur Administratoren dürfen Beiträge anpinnen."}
    end
  end

  def toggle_pin(_info, _args), do: {:error, "Nur Administratoren dürfen Beiträge anpinnen."}
end
