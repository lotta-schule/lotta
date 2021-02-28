defmodule ApiWeb.ArticleResolver do
  @moduledoc false

  import Api.Accounts.Permissions
  import ApiWeb.ErrorHelpers

  alias ApiWeb.Context
  alias Api.Content

  def get(%{id: id}, %{context: %Context{current_user: current_user}}) do
    article = Content.get_article(String.to_integer(id))

    cond do
      is_nil(article) ->
        {:error, "Beitrag nicht gefunden."}

      not can_read?(current_user, article) ->
        {:error, "Du hast nicht die Rechte dir diesen Beitrag anzusehen."}

      true ->
        {:ok, article}
    end
  end

  def get(_args, _info), do: {:error, "Beitrag nicht gefunden."}

  def get_topics(_args, %{context: %Context{current_user: current_user}}) do
    {:ok, Content.list_topics(current_user)}
  end

  def all(args, %{context: %Context{current_user: current_user}}) do
    {:ok,
     Content.list_articles(
       if args[:category_id] do
         String.to_integer(args[:category_id])
       end,
       current_user,
       args[:filter]
     )}
  end

  def all_unpublished(_args, _info) do
    {:ok, Content.list_unpublished_articles()}
  end

  def own(_args, %{context: %Context{current_user: current_user}}) do
    {:ok, Content.list_user_articles(current_user)}
  end

  def by_topic(%{topic: topic}, %{context: %Context{current_user: current_user}}) do
    {:ok, Content.list_articles_by_topic(current_user, topic)}
  end

  def create(%{article: article_params}, %{context: %Context{current_user: user}}) do
    article_params
    |> Content.create_article(user)
    |> format_errors("Erstellen des Beitrags fehlgeschlagen.")
  end

  def update(%{id: id, article: article_params}, %{context: %Context{current_user: current_user}}) do
    article = Content.get_article(String.to_integer(id))

    cond do
      is_nil(article) ->
        {:error, "Beitrag mit der id #{id} nicht gefunden."}

      not can_write?(current_user, article) ->
        {:error, "Du darfst diesen Beitrag nicht bearbeiten."}

      true ->
        article
        |> Content.update_article(article_params)
        |> format_errors("Bearbeiten des Beitrags fehlgeschlagen.")
    end
  end

  def delete(%{id: id}, %{context: %Context{current_user: current_user}}) do
    article = Content.get_article(String.to_integer(id))

    cond do
      is_nil(article) ->
        {:error, "Beitrag mit der id #{id} nicht gefunden."}

      not can_write?(current_user, article) ->
        {:error, "Du darfst diesen Beitrag nicht bearbeiten."}

      true ->
        article
        |> Content.delete_article()
        |> format_errors("Löschen des Beitrags fehlgeschlagen.")
    end
  end

  def toggle_pin(%{id: id}, _info) do
    article = Content.get_article(String.to_integer(id))

    if article do
      article
      |> Content.toggle_article_pin()
      |> format_errors("Beitrag konnte nicht angepinnt werden.")
    else
      {:error, "Beitrag mit der id #{id} nicht gefunden."}
    end
  end

  def article_is_updated_config(%{id: id}, %{context: %Context{current_user: current_user}}) do
    with {id, _} <- Integer.parse(id, 10),
         article when not is_nil(article) <- Api.Content.get_article(id),
         true <- Api.Accounts.Permissions.can_read?(current_user, article) do
      {:ok, topic: ["article:#{id}"]}
    else
      nil ->
        {:error, "Beitrag nicht gefunden."}

      false ->
        {:error, "Du hast nicht die Rechte dir diesen Beitrag anzusehen."}

      {:error, msg} ->
        {:error, msg}

      _ ->
        {:error, "Unbekannter Fehler"}
    end
  end
end
