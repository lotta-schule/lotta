defmodule Lotta.Tenants.TenantTest do
  @moduledoc false

  use Lotta.DataCase

  alias Lotta.Tenants.Tenant

  describe "update_changeset/2" do
    test "does not allow updating customer_no" do
      tenant = %Tenant{
        title: "Test Tenant",
        slug: "test",
        prefix: "tenant_1"
      }

      changeset = Tenant.update_changeset(tenant, %{customer_no: "12345"})

      refute Map.has_key?(changeset.changes, :customer_no)
    end

    test "allows updating standard tenant fields" do
      tenant = %Tenant{
        title: "Old",
        slug: "test",
        prefix: "tenant_1"
      }

      attrs = %{
        title: "New Title",
        address: "123 Main St",
        contact_email: "contact@example.com"
      }

      changeset = Tenant.update_changeset(tenant, attrs)

      assert changeset.changes.title == "New Title"
      assert changeset.changes.address == "123 Main St"
      assert changeset.changes.contact_email == "contact@example.com"
    end

    test "does not allow updating plan fields" do
      tenant = %Tenant{
        title: "Test",
        slug: "test",
        prefix: "tenant_1"
      }

      attrs = %{
        current_plan_name: "supporter",
        current_plan_expires_at: Date.utc_today(),
        next_plan_name: "supporter"
      }

      changeset = Tenant.update_changeset(tenant, attrs)

      refute Map.has_key?(changeset.changes, :current_plan_name)
      refute Map.has_key?(changeset.changes, :current_plan_expires_at)
      refute Map.has_key?(changeset.changes, :next_plan_name)
    end

    test "validates required fields" do
      tenant = %Tenant{slug: "test", prefix: "tenant_1"}
      changeset = Tenant.update_changeset(tenant, %{title: nil})

      refute changeset.valid?
      assert changeset.errors[:title]
    end

    test "allows nil address" do
      tenant = %Tenant{
        title: "Test",
        slug: "test",
        prefix: "tenant_1",
        address: "Old Address"
      }

      changeset = Tenant.update_changeset(tenant, %{address: nil})

      assert changeset.valid?
      assert changeset.changes.address == nil
    end
  end

  describe "update_by_admin_changeset/2" do
    test "allows admin to update customer_no" do
      tenant = %Tenant{
        title: "Test",
        slug: "test",
        prefix: "tenant_1"
      }

      changeset = Tenant.update_by_admin_changeset(tenant, %{customer_no: "12345"})

      assert changeset.changes.customer_no == "12345"
    end

    test "allows admin to update plan fields" do
      tenant = %Tenant{
        title: "Test",
        slug: "test",
        prefix: "tenant_1"
      }

      expires_at = Date.add(Date.utc_today(), 30)

      attrs = %{
        current_plan_name: "supporter",
        current_plan_expires_at: expires_at,
        next_plan_name: "supporter"
      }

      changeset = Tenant.update_by_admin_changeset(tenant, attrs)

      assert changeset.changes.current_plan_name == "supporter"
      assert changeset.changes.current_plan_expires_at == expires_at
      assert changeset.changes.next_plan_name == "supporter"
    end

    test "allows admin to update all tenant fields" do
      tenant = %Tenant{
        title: "Old",
        slug: "test",
        prefix: "tenant_1"
      }

      attrs = %{
        title: "New Title",
        address: "456 Admin St",
        contact_email: "admin@example.com",
        customer_no: "CUST-001",
        billing_address: "Billing Address",
        contact_name: "Admin User",
        contact_phone: "+1234567890"
      }

      changeset = Tenant.update_by_admin_changeset(tenant, attrs)

      assert changeset.changes.title == "New Title"
      assert changeset.changes.address == "456 Admin St"
      assert changeset.changes.contact_email == "admin@example.com"
      assert changeset.changes.customer_no == "CUST-001"
      assert changeset.changes.billing_address == "Billing Address"
      assert changeset.changes.contact_name == "Admin User"
      assert changeset.changes.contact_phone == "+1234567890"
    end

    test "validates required fields" do
      tenant = %Tenant{}
      changeset = Tenant.update_by_admin_changeset(tenant, %{})

      refute changeset.valid?
      assert changeset.errors[:title]
      assert changeset.errors[:slug]
      assert changeset.errors[:prefix]
    end

    test "allows nil address" do
      tenant = %Tenant{
        title: "Test",
        slug: "test",
        prefix: "tenant_1",
        address: "Old Address"
      }

      changeset = Tenant.update_by_admin_changeset(tenant, %{address: nil})

      assert changeset.valid?
      assert changeset.changes.address == nil
    end
  end

  describe "create_changeset/1" do
    test "assigns default plan on creation" do
      attrs = %{
        title: "New School",
        slug: "new-school"
      }

      changeset = Tenant.create_changeset(attrs)

      assert changeset.valid?
    end

    test "generates slug from title if not provided" do
      attrs = %{
        title: "My School"
      }

      changeset = Tenant.create_changeset(attrs)

      assert changeset.valid?
      assert changeset.changes.slug != nil
    end

    test "uses provided slug" do
      attrs = %{
        title: "My School",
        slug: "custom-slug"
      }

      changeset = Tenant.create_changeset(attrs)

      assert changeset.valid?
      assert changeset.changes.slug == "custom-slug"
    end
  end
end
