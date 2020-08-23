defmodule Api.WidgetResolver do
  @moduledoc """
    GraphQL Resolver Module for finding, creating, updating and deleting widgets
  """

  import Api.Accounts.Permissions

  alias Ecto.NoResultsError
  alias Api.Tenants

  def all(%{category_id: category_id}, %{context: context) do
    Tenants.list_widgets_by_category_id(
      category_id,
      context[:current_user],
      context[:user_group_ids]
    )
  end

  def all(_args, %{context: context}) do
    Tenants.list_widgets(context[:current_user], context[:user_group_ids])
  end

  def all(_args, _info) do
    {:error, "Tenant nicht gefunden"}
  end

  def create(%{title: title, type: type}, %{context: context}) do
    if context[:current_user] && user_is_admin?(context[:current_user]) do
      Tenants.create_widget(%{title: title, type: type})
    else
      {:error, "Nur Administratoren dürfen Widgets erstellen."}
    end
  end

  def update(%{id: id, widget: widget_params}, %{context: context}) do
    if context[:current_user] && user_is_admin?(context.current_user) do
      try do
        Tenants.get_widget!(id)
        |> Tenants.update_widget(widget_params)
      rescue
        NoResultsError ->
          {:error, "Marginale mit der id #{id} nicht gefunden."}
      end
    else
      {:error, "Nur Administratoren dürfen Widgets bearbeiten."}
    end
  end

  def delete(%{id: id}, %{context: context}) do
    if context[:current_user] && user_is_admin?(context.current_user) do
      try do
        Tenants.get_widget!(id)
        |> Tenants.delete_widget()
      rescue
        NoResultsError ->
          {:error, "Marginale mit der id #{id} nicht gefunden."}
      end
    else
      {:error, "Nur Administratoren dürfen Marginalen löschen."}
    end
  end
end
