defmodule LottaWeb.CategoryResolver do
  @moduledoc false

  import LottaWeb.ErrorHelpers

  alias Lotta.Tenants
  alias Lotta.Tenants.Category

  def resolve_widgets(_args, %{
        context: %{current_user: user},
        source: %Category{} = category
      }) do
    {:ok, Tenants.list_widgets_by_category(category, user)}
  end

  def all(_args, %{context: %{current_user: current_user}}) do
    {:ok, Tenants.list_categories(current_user)}
  end

  def update(%{id: id, category: category_params}, _info) do
    category = Tenants.get_category(id)

    if is_nil(category) do
      {:error, "Kategorie mit der id #{id} nicht gefunden."}
    else
      category
      |> Tenants.update_category(category_params)
      |> format_errors("Bearbeiten der Kategorie fehlgeschlagen.")
    end
  end

  def create(%{category: category_params}, _info) do
    category_params
    |> Tenants.create_category()
    |> format_errors("Erstellen der Kategorie fehlgeschlagen.")
  end

  def delete(%{id: id}, _info) do
    category = Tenants.get_category(id)

    if category do
      category
      |> Tenants.delete_category()
      |> format_errors("Löschen der Kategorie fehlgeschlagen.")
    else
      {:error, "Kategorie mit der id #{id} nicht gefunden."}
    end
  end
end
