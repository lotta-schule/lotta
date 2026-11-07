defmodule LottaWeb.UserSocketTest do
  @moduledoc false

  use LottaWeb.SubscriptionCase

  alias Lotta.Repo
  alias Lotta.Tenants

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)
    {:ok, tenant: Tenants.get_tenant_by_prefix(@prefix)}
  end

  describe "connect/3" do
    test "connects anonymously with a tenant id and sets the tenant context", %{tenant: tenant} do
      assert {:ok, _socket} =
               Phoenix.ChannelTest.connect(LottaWeb.UserSocket, %{"tid" => tenant.id})

      assert Logger.metadata()[:tenant_id] == tenant.id
      refute Logger.metadata()[:user_id]
    end

    test "rejects an unknown tenant" do
      assert :error = Phoenix.ChannelTest.connect(LottaWeb.UserSocket, %{"tid" => 0})
    end

    test "rejects params without tenant id" do
      assert :error = Phoenix.ChannelTest.connect(LottaWeb.UserSocket, %{})
    end
  end
end
