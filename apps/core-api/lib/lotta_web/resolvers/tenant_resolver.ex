defmodule LottaWeb.TenantResolver do
  @moduledoc false
  import Lotta.Guard

  alias LottaWeb.Urls
  alias Lotta.Tenants
  alias Lotta.Storage
  alias Lotta.Tenants.Tenant

  def resolve_logo_image_file(
        %Tenant{logo_image_file_id: file_id, prefix: prefix},
        _args,
        _info
      )
      when is_uuid(file_id),
      do: {:ok, Storage.get_file(file_id, prefix: prefix)}

  def resolve_logo_image_file(_info, _args, _tenant), do: {:ok, nil}

  def resolve_background_image_file(
        %Tenant{background_image_file_id: file_id, prefix: prefix},
        _args,
        _info
      )
      when is_uuid(file_id),
      do: {:ok, Storage.get_file(file_id, prefix: prefix)}

  def resolve_background_image_file(_tenant, _args, _info), do: {:ok, nil}

  def resolve_identifier(tenant, _args, _info), do: {:ok, Urls.get_tenant_identifier(tenant)}

  def resolve_custom_domains(_, _, _), do: {:ok, []}

  def resolve_host(tenant, _, _info), do: {:ok, Urls.get_tenant_host(tenant)}

  def get(_args, %{context: %{tenant: tenant}}) do
    {:ok, tenant}
  end

  def update(%{tenant: tenant_input}, %{
        context: %{tenant: tenant}
      }) do
    Tenants.update_tenant(tenant, tenant_input)
  end

  def usage(_args, %{context: %{tenant: tenant}}) do
    Tenants.get_usage(tenant)
  end

  def get_stats(_, %{context: %{tenant: tenant}}) do
    {:ok, Tenants.get_stats(tenant)}
  end
end
