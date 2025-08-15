defmodule Lotta.TenantsTest do
  @moduledoc false

  use Lotta.WorkerCase, async: false

  alias Lotta.Accounts.User
  alias Lotta.{Tenants, Repo}
  alias Lotta.Tenants.{CustomDomain, Tenant}

  @prefix "tenant_test"

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

    test "should get tenant by eduplaces id" do
      Tenants.get_tenant_by_slug("test")
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_change(:eduplaces_id, "eduplaces-123")
      |> Repo.update!()

      assert %Tenant{slug: "test", eduplaces_id: "eduplaces-123"} =
               Tenants.get_tenant_by_eduplaces_id("eduplaces-123")
    end

    @tag creates_tenant: true
    test "should create a new tenant" do
      tenant = %Tenant{
        title: "Chile Lotta",
        slug: "chile"
      }

      user = %User{
        name: "Salvador Allende",
        email: "salvador.allende@einsa.net"
      }

      assert {:ok, tenant} =
               Tenants.create_tenant(
                 tenant,
                 user
               )

      assert %{title: "Chile Lotta", slug: "chile", prefix: prefix} = tenant
      assert prefix == "tenant_#{tenant.id}"

      assert [%{name: "Salvador Allende", email: "salvador.allende@einsa.net"}] =
               Repo.all(Lotta.Accounts.User, prefix: tenant.prefix)
    end

    @tag creates_tenant: true
    test "should delete a given tenant" do
      tenant = %Tenant{
        title: "Chile Lotta",
        slug: "chile"
      }

      user = %User{
        name: "Salvador Allende",
        email: "salvador.allende@einsa.net"
      }

      assert {:ok, tenant} =
               Tenants.create_tenant(
                 tenant,
                 user
               )

      assert {:ok, _tenant} = Tenants.delete_tenant(tenant)

      assert_raise Postgrex.Error, fn ->
        Repo.all(Lotta.Accounts.User, prefix: tenant.prefix)
      end

      assert is_nil(Tenants.get_tenant(tenant.id))
    end
  end
end
