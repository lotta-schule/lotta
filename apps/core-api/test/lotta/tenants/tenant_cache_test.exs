defmodule Lotta.Tenants.TenantCacheTest do
  @moduledoc false

  # Not async: enables the (globally configured) cache for these tests only.
  use Lotta.DataCase, async: false

  alias Lotta.{Repo, Tenants}
  alias Lotta.Tenants.{CustomDomain, Tenant, TenantCache}

  setup do
    previous = Application.get_env(:lotta, TenantCache)
    Application.put_env(:lotta, TenantCache, enabled: true)
    TenantCache.clear_local()

    on_exit(fn ->
      Application.put_env(:lotta, TenantCache, previous)
      TenantCache.clear_local()
    end)

    {:ok, tenant: Tenants.get_tenant_by_prefix("tenant_test")}
  end

  describe "lookups" do
    test "caches a tenant by id, slug and custom domain", %{tenant: tenant} do
      Repo.insert!(%CustomDomain{host: "cached.example.com", tenant_id: tenant.id},
        prefix: "public"
      )

      assert %Tenant{id: id} = TenantCache.get_tenant(tenant.id)
      assert %Tenant{id: ^id} = TenantCache.get_tenant_by_slug(tenant.slug)
      assert %Tenant{id: ^id} = TenantCache.get_by_custom_domain("cached.example.com")

      # Change the row behind the cache's back: the cached values are returned.
      Repo.update_all(from(t in Tenant, where: t.id == ^id), [set: [title: "Changed"]],
        prefix: "public"
      )

      refute TenantCache.get_tenant(tenant.id).title == "Changed"
      refute TenantCache.get_tenant_by_slug(tenant.slug).title == "Changed"
      refute TenantCache.get_by_custom_domain("cached.example.com").title == "Changed"
    end

    test "does not cache misses" do
      assert is_nil(TenantCache.get_tenant_by_slug("not-there-yet"))
      assert is_nil(TenantCache.get_tenant(-1))
      assert is_nil(TenantCache.get_by_custom_domain("not-there-yet.example.com"))
    end

    test "falls back to the database when disabled", %{tenant: tenant} do
      Application.put_env(:lotta, TenantCache, enabled: false)

      assert %Tenant{} = TenantCache.get_tenant(tenant.id)

      Repo.update_all(from(t in Tenant, where: t.id == ^tenant.id), [set: [title: "Fresh"]],
        prefix: "public"
      )

      assert TenantCache.get_tenant(tenant.id).title == "Fresh"
    end
  end

  describe "invalidation" do
    test "updating a tenant through Lotta.Tenants clears the cache", %{tenant: tenant} do
      assert TenantCache.get_tenant_by_slug(tenant.slug).title == tenant.title

      assert {:ok, _} = Tenants.update_tenant(tenant, %{title: "New title"})

      assert TenantCache.get_tenant_by_slug(tenant.slug).title == "New title"
      assert TenantCache.get_tenant(tenant.id).title == "New title"
    end

    test "a failed update keeps the cache", %{tenant: tenant} do
      assert TenantCache.get_tenant(tenant.id)
      assert {:error, _} = Tenants.update_tenant(tenant, %{title: nil})
      assert TenantCache.get_tenant(tenant.id).title == tenant.title
    end

    test "invalidations broadcast by other nodes clear the local cache", %{tenant: tenant} do
      assert TenantCache.get_tenant(tenant.id)

      Repo.update_all(from(t in Tenant, where: t.id == ^tenant.id), [set: [title: "Remote"]],
        prefix: "public"
      )

      # Simulate a broadcast from another node and wait until it is handled.
      send(TenantCache.Invalidator, :invalidate_all)
      :sys.get_state(TenantCache.Invalidator)

      assert TenantCache.get_tenant(tenant.id).title == "Remote"
    end
  end
end
