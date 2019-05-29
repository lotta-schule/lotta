defmodule ApiWeb.TenantView do
  use ApiWeb, :view
  alias ApiWeb.TenantView

  def render("index.json", %{tenants: tenants}) do
    %{data: render_many(tenants, TenantView, "tenant.json")}
  end

  def render("show.json", %{tenant: tenant}) do
    %{data: render_one(tenant, TenantView, "tenant.json")}
  end

  def render("tenant.json", %{tenant: tenant}) do
    %{id: tenant.id,
      slug: tenant.slug,
      title: tenant.title}
  end
end
