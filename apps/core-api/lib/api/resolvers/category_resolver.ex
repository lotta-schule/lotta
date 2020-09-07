defmodule Api.CategoryResolver do
  @moduledoc """
    GraphQL Resolver Module for finding, creating, updating and deleting categories
  """

  import Api.Accounts.Permissions

  alias ApiWeb.ErrorHelpers
  alias Api.System

  def all(_args, %{context: %{current_user: current_user, user_group_ids: user_group_ids}}) do
    {:ok,
     System.list_categories(
       current_user,
       user_group_ids,
       user_is_admin?(current_user)
     )}
  end

  def all(_args, _info) do
    {:ok, System.list_categories(nil, [], false)}
  end

  def update(%{id: id, category: category_params}, %{context: context}) do
    if context[:current_user] && user_is_admin?(context.current_user) do
      try do
        category = System.get_category!(id)

        case System.update_category(category, category_params) do
          {:ok, category} ->
            {:ok, category}

          {:error, error} ->
            {:error,
             [
               "Fehler beim Bearbeiten der Kategorie",
               details: ErrorHelpers.extract_error_details(error)
             ]}
        end
      rescue
        Ecto.NoResultsError ->
          {:error, "Kategorie mit der id #{id} nicht gefunden."}
      end
    else
      {:error, "Nur Administrator dürfen Kategorien bearbeiten."}
    end
  end

  def create(%{category: category_params}, %{context: context}) do
    if context[:current_user] && user_is_admin?(context.current_user) do
      case System.create_category(category_params) do
        {:ok, category} ->
          {:ok, category}

        {:error, error} ->
          {:error,
           [
             "Fehler beim Erstellen der Kategorie",
             details: ErrorHelpers.extract_error_details(error)
           ]}
      end
    else
      {:error, "Nur Administrator dürfen Kategorien erstellen."}
    end
  end

  def delete(%{id: id}, %{context: context}) do
    if context[:current_user] && user_is_admin?(context.current_user) do
      try do
        category = System.get_category!(id)

        case System.delete_category(category) do
          {:ok, category} ->
            {:ok, category}

          {:error, error} ->
            {:error,
             [
               "Fehler beim Löschen der Kategorie",
               details: ErrorHelpers.extract_error_details(error)
             ]}
        end
      rescue
        Ecto.NoResultsError ->
          {:error, "Kategorie mit der id #{id} nicht gefunden."}
      end
    else
      {:error, "Nur Administrator dürfen Kategorien löschen."}
    end
  end
end
