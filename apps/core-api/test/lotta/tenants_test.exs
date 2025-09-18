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

    test "slug_available?/1 returns false for occupied slugs" do
      assert Tenants.slug_available?("test") == false
    end

    test "slug_available?/1 returns false for reserved slugs" do
      assert Tenants.slug_available?("admin") == false
      assert Tenants.slug_available?("api") == false
      assert Tenants.slug_available?("www") == false
    end

    test "slug_available?/1 returns true for available slugs" do
      assert Tenants.slug_available?("available-slug") == true
    end

    test "get_occupied_slugs/0 returns list of occupied slugs" do
      occupied_slugs = Tenants.get_occupied_slugs()
      assert "test" in occupied_slugs
    end

    test "get_reserved_slugs/0 returns list of reserved slugs" do
      reserved_slugs = Tenants.get_reserved_slugs()
      assert "admin" in reserved_slugs
      assert "api" in reserved_slugs
      assert "www" in reserved_slugs
    end

    @tag creates_tenant: true
    test "should create a new tenant with eduplaces user" do
      import Mock

      tenant = %Tenant{
        title: "Eduplaces School",
        slug: "eduplaces"
      }

      user = %User{
        eduplaces_id: "eduplaces-user-123"
      }

      with_mock(Lotta.Accounts,
        register_eduplaces_user: fn tenant, _user_info ->
          {:ok,
           %User{
             id: 999,
             name: "Test User",
             email: "test@eduplaces.com",
             eduplaces_id: "eduplaces-user-123",
             groups: []
           }
           |> Repo.insert!(prefix: tenant.prefix)}
        end
      ) do
        assert {:ok, tenant} = Tenants.create_tenant(tenant, user)

        assert %{title: "Eduplaces School", slug: "eduplaces", prefix: prefix} = tenant
        assert prefix == "tenant_#{tenant.id}"

        assert_called(Lotta.Accounts.register_eduplaces_user(tenant, %Lotta.Eduplaces.UserInfo{id: "eduplaces-user-123"}))
      end
    end

    @tag creates_tenant: true
    test "should fail to create tenant when neither email nor eduplaces_id is provided" do
      tenant = %Tenant{
        title: "Invalid User Tenant",
        slug: "invalid"
      }

      user = %User{
        name: "Test User"
      }

      assert {:error, _} = Tenants.create_tenant(tenant, user)
    end
  end
end
