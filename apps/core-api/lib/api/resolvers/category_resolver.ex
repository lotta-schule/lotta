defmodule Api.CategoryResolver do
  alias Api.Accounts.User

  def all(_args, %{context: %{current_user: current_user, user_group_ids: user_group_ids, tenant: tenant} = context}) do
    {:ok, Api.Tenants.list_categories_by_tenant(tenant, current_user, user_group_ids, context[:user_is_admin])}
  end
  def all(_args, %{context: %{tenant: tenant}}) do
    {:ok, Api.Tenants.list_categories_by_tenant(tenant, nil, [], false)}
  end
  def all(_args, _info) do
    {:error, "Tenant nicht gefunden"}
  end

  def update(%{id: id, category: category_params}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && context[:user_is_admin] do
      try do
        category = Api.Tenants.get_category!(id)
        case Api.Tenants.update_category(category, category_params) do
          {:error, changeset} ->
            {
              :error,
              message: "Fehler beim Bearbeiten der Kategorie.",
              details: error_details(changeset)
            }
          success ->
            success
        end
      rescue
        Ecto.NoResultsError ->
          {:error, "Kategorie mit der id #{id} nicht gefunden."}
      end
    else
      {:error, "Nur Administrator dürfen Kategorien bearbeiten."}
    end
  end
  
  def create(%{category: category_params}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && context[:user_is_admin] do
      case Api.Tenants.create_category(tenant, category_params) do
        {:error, changeset} ->
          {
            :error,
            message: "Fehler beim Erstellen der Kategorie.",
            details: error_details(changeset)
          }
        success ->
          success
      end
    else
      {:error, "Nur Administrator dürfen Kategorien erstellen."}
    end
  end
  
  def delete(%{id: id}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && context[:user_is_admin] do
      try do
        category = Api.Tenants.get_category!(id)
        case Api.Tenants.delete_category(category) do
          {:error, changeset} ->
            {
              :error,
              message: "Fehler beim Löschen der Kategorie.",
              details: error_details(changeset)
            }
          success ->
            success
        end
      rescue
        Ecto.NoResultsError ->
          {:error, "Kategorie mit der id #{id} nicht gefunden."}
      end
    else
      {:error, "Nur Administrator dürfen Kategorien löschen."}
    end
  end

  defp error_details(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {msg, _} -> msg end)
  end
end