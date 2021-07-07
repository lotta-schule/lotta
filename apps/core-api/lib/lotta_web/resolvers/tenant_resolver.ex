defmodule LottaWeb.TenantResolver do
  @moduledoc false

  alias LottaWeb.Urls
  alias Lotta.Tenants

  def resolve_configuration(_parent, _info) do
    {:ok, Tenants.get_configuration()}
  end

  def get(_args, %{context: %{tenant: tenant}}) do
    {:ok, tenant}
  end

  def update(%{tenant: tenant_input}, %{
        context: %{tenant: tenant}
      }) do
    configuration = Map.get(tenant, :configuration, %{}) || %{}

    with {:ok, tenant} <- Tenants.update_tenant(tenant, tenant_input),
         {:ok, configuration} <- Tenants.update_configuration(tenant, configuration) do
      {:ok, Map.put(tenant, :configuration, configuration)}
    else
      error ->
        error
    end
  end

  def usage(_args, %{context: %{tenant: tenant}}) do
    Tenants.get_usage(tenant)
  end

  def custom_domains(_, _), do: {:ok, []}

  def host(_, %{context: %{tenant: tenant}}) do
    {:ok, Urls.get_tenant_host(tenant)}
  end
end
