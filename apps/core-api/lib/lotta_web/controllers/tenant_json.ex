defmodule LottaWeb.TenantJSON do
  @moduledoc false
  use LottaWeb, :html

  def created(%{tenant: tenant}),
    do: %{
      success: true,
      tenant: format_tenant(tenant)
    }

  def deleted(%{tenant: _tenant}),
    do: %{
      success: true
    }

  def list(%{tenants: tenants}),
    do: %{
      success: true,
      tenants: Enum.map(tenants, &format_tenant/1)
    }

  defp format_tenant(tenant),
    do: %{
      id: tenant.id,
      slug: tenant.slug,
      title: tenant.title,
      backgroundImageFile: tenant.background_image_file_id,
      logoImageFile: tenant.logo_image_file_id,
      insertedAt: tenant.inserted_at,
      updatedAt: tenant.updated_at
    }
end
