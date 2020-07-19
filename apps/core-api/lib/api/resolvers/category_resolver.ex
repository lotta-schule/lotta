defmodule Api.CategoryResolver do
  @moduledoc """
    GraphQL Resolver Module for finding, creating, updating and deleting categories
  """

  import Api.Accounts.Permissions

  alias ApiWeb.ErrorHelpers
  alias Api.Tenants

  def all(_args, %{
        context: %{current_user: current_user, user_group_ids: user_group_ids, tenant: tenant}
      }) do
    {:ok,
     Tenants.list_categories_by_tenant(
       tenant,
       current_user,
       user_group_ids,
       user_is_admin?(current_user, tenant)
     )}
  end

  def all(_args, %{context: %{tenant: tenant}}) do
    {:ok, Tenants.list_categories_by_tenant(tenant, nil, [], false)}
  end

  def all(_args, _info) do
    {:error, "Tenant nicht gefunden"}
  end

  def update(%{id: id, category: category_params}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && user_is_admin?(context.current_user, tenant) do
      try do
        category = Tenants.get_category!(id)

        case Tenants.update_category(category, category_params) do
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

  def create(%{category: category_params}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && user_is_admin?(context.current_user, tenant) do
      case Tenants.create_category(tenant, category_params) do
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

  def delete(%{id: id}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && user_is_admin?(context.current_user, tenant) do
      try do
        category = Tenants.get_category!(id)

        case Tenants.delete_category(category) do
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
