defmodule Api.CategoryResolver do
  alias Api.Accounts.User

  def all(_args, %{context: %{context: %{current_user: current_user, tenant: tenant}}}) do
    {:ok, Api.Tenants.list_categories_by_tenant(tenant, current_user)}
  end
  def all(_args, %{context: %{context: %{tenant: tenant}}}) do
    {:ok, Api.Tenants.list_categories_by_tenant(tenant, nil)}
  end
  def all(_args, _info) do
    {:error, "Tenant nicht gefunden"}
  end

  def update(%{id: id, category: category_params}, %{context: %{context: %{current_user: current_user, tenant: tenant}}}) do
    if User.is_admin?(current_user, tenant) do
      case Api.Tenants.get_category!(id) do
        nil -> {:error, "Kategorie mit der id #{id} nicht gefunden."}
        category -> Api.Tenants.update_category(category, category_params)
      end
    else
      {:error, "Nur Administrator dürfen Kategorien bearbeiten"}
    end
  end
end