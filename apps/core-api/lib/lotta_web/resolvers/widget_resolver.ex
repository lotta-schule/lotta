defmodule LottaWeb.WidgetResolver do
  @moduledoc false

  import LottaWeb.ErrorHelpers

  alias LottaWeb.Context
  alias Lotta.Tenants

  def all(%{category_id: category_id}, %{
        context: %Context{current_user: current_user}
      }) do
    category = Tenants.get_category(category_id)

    if category do
      {:ok,
       Tenants.list_widgets_by_category(
         category,
         current_user
       )}
    else
      {:error, "Kategorie mit der id #{category_id} nicht gefunden."}
    end
  end

  def all(_args, %{context: %Context{current_user: current_user}}) do
    {:ok, Tenants.list_widgets(current_user)}
  end

  def create(args, _info) do
    args
    |> Tenants.create_widget()
    |> format_errors("Erstellen der Marginale fehlgeschlagen.")
  end

  def update(%{id: id, widget: widget_params}, _info) do
    widget = Tenants.get_widget(id)

    if widget do
      widget
      |> Tenants.update_widget(widget_params)
      |> format_errors("Bearbeiten der Marginale fehlgeschlagen.")
    else
      {:error, "Marginale mit der id #{id} nicht gefunden."}
    end
  end

  def delete(%{id: id}, _info) do
    widget = Tenants.get_widget(id)

    if widget do
      widget
      |> Tenants.delete_widget()
      |> format_errors("Löschen der Marginale fehlgeschlagen.")
    else
      {:error, "Marginale mit der id #{id} nicht gefunden."}
    end
  end
end
