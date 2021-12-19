defmodule LottaWeb.ArticleResolver do
  @moduledoc false

  require Logger

  import Lotta.Accounts.Permissions
  import LottaWeb.ErrorHelpers

  alias LottaWeb.Context
  alias Lotta.{Content, Repo}

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

  def get_all_tags(_args, %{context: %Context{current_user: current_user}}) do
    {:ok, Content.list_all_tags(current_user)}
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

  def by_tag(%{tag: tag}, %{context: %Context{current_user: current_user}}) do
    {:ok, Content.list_articles_by_tag(current_user, tag)}
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

  def article_is_updated_config(%{id: id}, %{
        context: %Context{current_user: current_user, tenant: %{id: tid} = tenant}
      }) do
    Repo.put_prefix(tenant.prefix)

    with {id, _} <- Integer.parse(id, 10),
         article when not is_nil(article) <- Lotta.Content.get_article(id),
         true <- can_read?(current_user, article) do
      {:ok, topic: ["#{tid}:article:#{id}"]}
    else
      nil ->
        {:error, "Beitrag nicht gefunden."}

      false ->
        {:error, "Du hast nicht die Rechte dir diesen Beitrag anzusehen."}

      {:error, msg} ->
        {:error, msg}

      e ->
        Logger.error(inspect(e))
        {:error, "Unbekannter Fehler"}
    end
  end
end
