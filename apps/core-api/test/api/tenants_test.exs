defmodule Lotta.TenantsTest do
  @moduledoc false

  use Lotta.DataCase, async: true
  alias Lotta.Tenants
  alias Lotta.Tenants.Tenant

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
  end
end
