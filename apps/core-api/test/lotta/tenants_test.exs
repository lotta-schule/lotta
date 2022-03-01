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

    test "should create a new tenant" do
      assert {:ok, tenant} =
               Tenants.create_tenant(
                 user_params: %{name: "Salvador Allende", email: "salvador.allende@einsa.net"},
                 tenant: %{title: "Chile Lotta", slug: "chile"}
               )

      assert %{title: "Chile Lotta", slug: "chile"} = tenant

      assert [%{name: "Salvador Allende", email: "salvador.allende@einsa.net"}] =
               Lotta.Repo.all(Lotta.Accounts.User, prefix: tenant.prefix)
    end

    test "should delete a given tenant" do
      assert {:ok, tenant} =
               Tenants.create_tenant(
                 user_params: %{name: "Salvador Allende", email: "salvador.allende@einsa.net"},
                 tenant: %{title: "Chile Lotta", slug: "chile"}
               )

      assert {:ok, _tenant} = Tenants.delete_tenant(tenant)

      assert_raise Postgrex.Error, fn ->
        Lotta.Repo.all(Lotta.Accounts.User, prefix: tenant.prefix)
      end

      assert is_nil(Tenants.get_tenant(tenant.id))
    end
  end
end
