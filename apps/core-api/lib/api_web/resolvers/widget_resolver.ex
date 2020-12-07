defmodule ApiWeb.WidgetResolver do
  @moduledoc false

  import ApiWeb.ErrorHelpers

  alias ApiWeb.Context
  alias Api.System

  def all(%{category_id: category_id}, %{
        context: %Context{current_user: current_user}
      }) do
    category = System.get_category(category_id)

    if category do
      {:ok,
       System.list_widgets_by_category(
         category,
         current_user
       )}
    else
      {:error, "Kategorie mit der id #{category_id} nicht gefunden."}
    end
  end

  def all(_args, %{context: %Context{current_user: current_user}}) do
    {:ok, System.list_widgets(current_user)}
  end

  def create(args, _info) do
    args
    |> System.create_widget()
    |> format_errors("Erstellen der Marginale fehlgeschlagen.")
  end

  def update(%{id: id, widget: widget_params}, _info) do
    widget = System.get_widget(id)

    if widget do
      widget
      |> System.update_widget(widget_params)
      |> format_errors("Bearbeiten der Marginale fehlgeschlagen.")
    else
      {:error, "Marginale mit der id #{id} nicht gefunden."}
    end
  end

  def delete(%{id: id}, _info) do
    widget = System.get_widget(id)

    if widget do
      widget
      |> System.delete_widget()
      |> format_errors("Löschen der Marginale fehlgeschlagen.")
    else
      {:error, "Marginale mit der id #{id} nicht gefunden."}
    end
  end
end
