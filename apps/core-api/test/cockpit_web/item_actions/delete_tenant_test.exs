defmodule CockpitWeb.ItemActions.DeleteTenantTest do
  @moduledoc false

  use Lotta.DataCase

  import Mock
  import Phoenix.LiveViewTest

  alias CockpitWeb.ItemActions.DeleteTenant
  alias Lotta.Tenants.Tenant

  describe "icon/2" do
    test "renders trash icon" do
      assigns = %{}
      item = %Tenant{}

      html = rendered_to_string(DeleteTenant.icon(assigns, item))

      assert html =~ ~s|hero-trash|
      assert html =~ ~s|h-5 w-5|
      assert html =~ ~s|cursor-pointer|
      assert html =~ ~s|transition duration-75|
      assert html =~ ~s|hover:scale-110|
      assert html =~ ~s|hover:text-green-600|
    end

    test "icon is renderable regardless of item content" do
      assigns = %{}
      item = %Tenant{id: 1, title: "Test Tenant", slug: "test"}

      html = rendered_to_string(DeleteTenant.icon(assigns, item))

      assert html =~ ~s|hero-trash|
    end
  end

  describe "handle/3" do
    setup do
      tenant = %Tenant{
        id: 1,
        title: "Test School",
        slug: "test-school",
        prefix: "tenant_1"
      }

      socket = %Phoenix.LiveView.Socket{
        assigns: %{__changed__: %{}, flash: %{}}
      }

      {:ok, tenant: tenant, socket: socket}
    end

    test "successfully deletes tenant and shows success flash", %{
      tenant: tenant,
      socket: socket
    } do
      with_mock Lotta.Tenants, [:passthrough], delete_tenant: fn ^tenant -> {:ok, tenant} end do
        {:ok, updated_socket} = DeleteTenant.handle(socket, [tenant], %{})

        assert called(Lotta.Tenants.delete_tenant(tenant))

        assert Phoenix.Flash.get(updated_socket.assigns.flash, :info) ==
                 "Tenant successfully deleted."
      end
    end

    test "returns error changeset when deletion fails", %{tenant: tenant, socket: socket} do
      error_reason = "Database constraint violation"

      with_mock Lotta.Tenants, [:passthrough],
        delete_tenant: fn ^tenant -> {:error, error_reason} end do
        {:error, changeset} = DeleteTenant.handle(socket, [tenant], %{})

        assert called(Lotta.Tenants.delete_tenant(tenant))
        assert changeset.data == tenant
        assert changeset.errors[:base] != nil

        {message, _} = changeset.errors[:base]
        assert message =~ "Failed to delete tenant"
        assert message =~ inspect(error_reason)
      end
    end

    test "handles multiple items but only processes first", %{tenant: tenant, socket: socket} do
      tenant2 = %Tenant{id: 2, title: "Another Tenant", slug: "another", prefix: "tenant_2"}

      with_mock Lotta.Tenants, [:passthrough], delete_tenant: fn ^tenant -> {:ok, tenant} end do
        {:ok, _updated_socket} = DeleteTenant.handle(socket, [tenant, tenant2], %{})

        # Should only be called once with the first tenant
        assert called(Lotta.Tenants.delete_tenant(tenant))
        refute called(Lotta.Tenants.delete_tenant(tenant2))
      end
    end
  end

  describe "confirm/1" do
    test "returns confirmation message" do
      assigns = %{}

      message = DeleteTenant.confirm(assigns)

      assert message ==
               "Are you sure you want to delete the tenant? This action cannot be undone."

      assert is_binary(message)
    end

    test "confirmation message is clear and warns about irreversibility" do
      message = DeleteTenant.confirm(%{})

      assert message =~ "Are you sure"
      assert message =~ "cannot be undone"
    end
  end

  describe "label/2" do
    test "returns Delete label" do
      assigns = %{}
      item = %Tenant{}

      label = DeleteTenant.label(assigns, item)

      assert label == "Delete"
    end

    test "label is consistent regardless of item" do
      assigns = %{}
      item1 = %Tenant{id: 1, title: "Tenant 1"}
      item2 = %Tenant{id: 2, title: "Tenant 2"}

      assert DeleteTenant.label(assigns, item1) == "Delete"
      assert DeleteTenant.label(assigns, item2) == "Delete"
    end
  end

  describe "confirm_label/1" do
    test "returns Delete label" do
      assigns = %{}

      label = DeleteTenant.confirm_label(assigns)

      assert label == "Delete"
    end

    test "confirm label matches action intent" do
      label = DeleteTenant.confirm_label(%{})

      assert is_binary(label)
      assert label == "Delete"
    end
  end

  describe "cancel_label/1" do
    test "returns Cancel label" do
      assigns = %{}

      label = DeleteTenant.cancel_label(assigns)

      assert label == "Cancel"
    end

    test "cancel label is clear" do
      label = DeleteTenant.cancel_label(%{})

      assert is_binary(label)
      assert label == "Cancel"
    end
  end
end
