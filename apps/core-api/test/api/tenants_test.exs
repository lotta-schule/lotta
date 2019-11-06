defmodule Api.TenantsTest do
  use Api.DataCase
  alias Api.Fixtures
  alias Api.Tenants

  
  describe "tenants" do
    test "list_tenants/0 returns all tenants" do
      tenant = Fixtures.fixture(:tenant)

      assert Tenants.list_tenants == [tenant]
    end

    test "get_tenant!/1 returns the tenant with given id" do
      tenant = Fixtures.fixture(:tenant)
      assert Tenants.get_tenant!(tenant.id) == tenant
    end

    test "get_tenant_by_slug!/1 returns the tenant with given slug" do
      tenant = Fixtures.fixture(:tenant)
      assert Tenants.get_tenant_by_slug!(tenant.slug) == tenant
    end

    test "update_tenant/2 should update the tenant" do
      tenant = Fixtures.fixture(:tenant)
      {:ok, new_tenant} = Tenants.update_tenant(tenant, %{title: "Mein Neuer Titel"})
      assert new_tenant.title == "Mein Neuer Titel"
    end
  end
end