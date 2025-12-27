defmodule LottaWeb.ArticleResolver do
  @moduledoc false

  require Logger

  import Lotta.Accounts.Permissions
  import LottaWeb.ErrorHelpers

  alias Lotta.{Accounts, Content, Tenants, Repo}

  def get(%{id: id}, %{context: %{current_user: current_user}}) do
    with {id, _} <- Integer.parse(id, 10),
         article when not is_nil(article) <- Content.get_article(id),
         true <- can_read?(current_user, article) do
      {:ok, article}
    else
      :error ->
        {:error, "Beitrag nicht gefunden."}

      nil ->
        {:error, "Beitrag nicht gefunden."}

      false ->
        {:error, "Du hast nicht die Rechte dir diesen Beitrag anzusehen."}

      error ->
        error
    end
  end

  def get(_args, _info), do: {:error, "Beitrag nicht gefunden."}

  def get_all_tags(_args, %{context: %{current_user: current_user}}) do
    {:ok, Content.list_all_tags(current_user)}
  end

  def all(%{category_id: category_id} = args, %{context: %{current_user: current_user}}) do
    case Integer.parse(category_id) do
      {category_id, _} ->
        {:ok,
         Content.list_articles(
           Tenants.get_category(category_id),
           current_user,
           args[:filter]
         )}

      :error ->
        {:error, "Beitrag nicht gefunden."}
    end
  end

  def all_unpublished(_args, _info) do
    {:ok, Content.list_unpublished_articles()}
  end

  def with_user_files(%{user_id: user_id}, _info) do
    user = Accounts.get_user(String.to_integer(user_id))

    if is_nil(user) do
      {:error, "Nutzer mit der ID #{user_id} nicht gefunden."}
    else
      articles =
        user
        |> Content.list_articles_with_files_from_user()
        |> Enum.map(&elem(&1, 1))
        |> Enum.sort_by(& &1.id)

      {:ok, articles}
    end
  end

  def own(_args, %{context: %{current_user: current_user}}) do
    {:ok, Content.list_user_articles(current_user)}
  end

  def by_tag(%{tag: tag}, %{context: context}) do
    {:ok, Content.list_articles_by_tag(context.current_user, tag)}
  end

  def by_user(%{id: user_id}, %{context: context}) do
    user = Accounts.get_user(String.to_integer(user_id))

    if is_nil(user) do
      {:error, "Nutzer mit der ID #{user_id} nicht gefunden."}
    else
      {:ok, Content.list_articles_by_user(context.current_user, user)}
    end
  end

  def create(%{article: article_params}, %{context: %{current_user: user}}) do
    article_params
    |> Content.create_article(user)
    |> format_errors("Erstellen des Beitrags fehlgeschlagen.")
  end

  def update(%{id: id, article: article_params}, %{context: %{current_user: current_user}}) do
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

  def delete(%{id: id}, %{context: %{current_user: current_user}}) do
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
        context: %{current_user: current_user, tenant: %{id: tid} = tenant}
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
