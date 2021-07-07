defmodule LottaWeb.CategoryResolver do
  @moduledoc false

  import Ecto.Query
  import LottaWeb.ErrorHelpers

  alias LottaWeb.Context
  alias Lotta.Repo
  alias Lotta.Tenants
  alias Lotta.Accounts.User
  alias Lotta.Tenants.{Category, Widget}

  def resolve_widgets(_args, %{
        context: %Context{current_user: %User{all_groups: groups, is_admin?: is_admin}},
        source: %Category{} = category
      }) do
    widgets =
      from(w in Widget,
        left_join: wug in "widgets_user_groups",
        on: wug.widget_id == w.id,
        join: cw in "categories_widgets",
        on: w.id == cw.widget_id,
        where:
          (^is_admin or wug.group_id in ^Enum.map(groups, & &1.id) or is_nil(wug.group_id)) and
            cw.category_id == ^category.id,
        distinct: w.id
      )
      |> Repo.all()

    {:ok, widgets}
  end

  def all(_args, %{context: %Context{current_user: current_user}}) do
    {:ok, Tenants.list_categories(current_user)}
  end

  def update(%{id: id, category: category_params}, _info) do
    category = Tenants.get_category(id)

    if not is_nil(category) do
      category
      |> Tenants.update_category(category_params)
      |> format_errors("Bearbeiten der Kategorie fehlgeschlagen.")
    else
      {:error, "Kategorie mit der id #{id} nicht gefunden."}
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
