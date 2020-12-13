defmodule ApiWeb.CategoryResolver do
  @moduledoc false

  import ApiWeb.ErrorHelpers

  alias ApiWeb.Context
  alias Api.System

  def all(_args, %{context: %Context{current_user: current_user}}) do
    {:ok, System.list_categories(current_user)}
  end

  def update(%{id: id, category: category_params}, _info) do
    category = System.get_category(id)

    if category do
      category
      |> System.update_category(category_params)
      |> format_errors("Bearbeiten der Kategorie fehlgeschlagen.")
    else
      {:error, "Kategorie mit der id #{id} nicht gefunden."}
    end
  end

  def create(%{category: category_params}, _info) do
    category_params
    |> System.create_category()
    |> format_errors("Erstellen der Kategorie fehlgeschlagen.")
  end

  def delete(%{id: id}, _info) do
    category = System.get_category(id)

    if category do
      category
      |> System.delete_category()
      |> format_errors("Löschen der Kategorie fehlgeschlagen.")
    else
      {:error, "Kategorie mit der id #{id} nicht gefunden."}
    end
  end
end
