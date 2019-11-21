defmodule Api.Services.EmailSendRequest do
  alias Api.Tenants.Tenant
  defstruct [:to, :subject, :template, :templatevars]

  def get_tenant_info(%Tenant{} = tenant) do
    tenant = Api.Repo.preload(tenant, :logo_image_file)
    %{
      id: tenant.id,
      custom_theme: tenant.custom_theme,
      slug: tenant.slug,
      title: tenant.title,
      url: Tenant.get_main_url(tenant),
      logo_url: tenant.logo_image_file &&
        tenant.logo_image_file.remote_location
    }
  end
end