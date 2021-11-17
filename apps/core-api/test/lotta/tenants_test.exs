defmodule Lotta.TenantsTest do
  @moduledoc false

  use Lotta.DataCase, async: true
  alias Lotta.Tenants
  alias Lotta.Tenants.{CustomDomain, Tenant}

  @prefix "tenant_test"

  setup do
    :ok
  end

  describe "Tenants" do
    test "should get tenant by prefix" do
      assert %Tenant{prefix: @prefix} = Tenants.get_tenant_by_prefix(@prefix)
    end

    test "should get tenant by slug" do
      assert %Tenant{slug: "test"} = Tenants.get_tenant_by_slug("test")
    end

    test "should get tenant by custom domain" do
      tenant = Tenants.get_tenant_by_slug("test")

      domain = %CustomDomain{
        host: "test-domain.com",
        is_main_domain: true,
        tenant_id: tenant.id
      }

      Repo.insert!(domain)
      assert %Tenant{slug: "test"} = Tenants.get_by_custom_domain("test-domain.com")
    end
  end
end
