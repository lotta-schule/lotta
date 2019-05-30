defmodule Api.CategoryResolver do
  alias Api.Tenants.Category

  def all(_args, %{context: %{context: %{tenant: tenant}}}) do
    {:ok, Api.Tenants.list_categories_by_tenant(tenant.id)}
  end
  def all(_args, _info) do
    {:error, "Tenant nicht gefunden"}
  end

  def find(%{id: id}, %{context: %{context: %{tenant: tenant}}}) do
    {:ok, Api.Tenants.Category.find_by([id: id, tenant_id: tenant.id])}
  end
  def find(_args, _info) do
    {:error, "Tenant nicht gefunden"}
  end

  def update(%{id: id, user: user_params}, _info) do
    Accounts.get_user!(id)
    |> Accounts.update_user(user_params)
  end
end