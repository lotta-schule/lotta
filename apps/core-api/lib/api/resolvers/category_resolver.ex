defmodule Api.CategoryResolver do
  alias Api.Accounts.User

  def all(_args, %{context: %{current_user: current_user, tenant: tenant}}) do
    {:ok, Api.Tenants.list_categories_by_tenant(tenant, current_user)}
  end
  def all(_args, %{context: %{tenant: tenant}}) do
    {:ok, Api.Tenants.list_categories_by_tenant(tenant, nil)}
  end
  def all(_args, _info) do
    {:error, "Tenant nicht gefunden"}
  end

  def update(%{id: id, category: category_params}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && User.is_admin?(context.current_user, tenant) do
      try do
        category = Api.Tenants.get_category!(id)
        case Api.Tenants.update_category(category, category_params) do
          {:error, changeset} ->
            {
              :error,
              message: "Registrierung fehlgeschlagen.",
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

  defp error_details(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {msg, _} -> msg end)
  end
end