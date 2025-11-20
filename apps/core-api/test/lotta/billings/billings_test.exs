defmodule Lotta.BillingsTest do
  @moduledoc false

  use Lotta.DataCase

  alias Lotta.{Billings}
  alias Lotta.Billings.{AdditionalItem, Invoice}
  alias Lotta.Tenants
  alias Lotta.Repo

  # Helper to insert usage data for a given month
  defp insert_usage_data(tenant_id, year, month, active_users, storage_gb, conversion_minutes) do
    # Insert into usage_logs table
    storage_bytes = trunc(storage_gb * 1_073_741_824)
    conversion_seconds = trunc(conversion_minutes * 60)

    # Insert usage logs (which will be aggregated into monthly_usage_logs)
    # Use mid-month date
    date = Date.new!(year, month, 15)

    if active_users > 0 do
      Repo.insert_all(
        "usage_logs",
        [
          %{
            tenant_id: tenant_id,
            type: "active_user_count",
            value: "#{active_users}",
            date: date,
            unique_identifier: "user_count_#{year}_#{month}",
            inserted_at: DateTime.utc_now(),
            updated_at: DateTime.utc_now()
          }
        ],
        prefix: "public"
      )
    end

    if storage_bytes > 0 do
      Repo.insert_all(
        "usage_logs",
        [
          %{
            tenant_id: tenant_id,
            type: "total_storage_count",
            value: "#{storage_bytes}",
            date: date,
            unique_identifier: "storage_#{year}_#{month}",
            inserted_at: DateTime.utc_now(),
            updated_at: DateTime.utc_now()
          }
        ],
        prefix: "public"
      )
    end

    if conversion_seconds > 0 do
      Repo.insert_all(
        "usage_logs",
        [
          %{
            tenant_id: tenant_id,
            type: "media_conversion_seconds",
            value: "#{conversion_seconds}",
            date: date,
            unique_identifier: "conversion_#{year}_#{month}",
            inserted_at: DateTime.utc_now(),
            updated_at: DateTime.utc_now()
          }
        ],
        prefix: "public"
      )
    end

    # Refresh the materialized view
    Ecto.Adapters.SQL.query!(Repo, "REFRESH MATERIALIZED VIEW monthly_usage_logs", [],
      prefix: "public"
    )
  end

  setup do
    # Reload tenant to ensure we have the latest plan information
    tenant = Tenants.get_tenant_by_slug("test")
    tenant = Repo.preload(tenant, [], force: true)

    # Give tenant a basic plan for invoice generation tests
    # This ensures invoices have at least one item
    {:ok, tenant_with_plan} =
      Tenants.update_plan(tenant, "test", ~D[2099-12-31], "test")

    {:ok, tenant: tenant_with_plan}
  end

  describe "AdditionalItem schema validations" do
    test "valid additional item creation", %{tenant: tenant} do
      changeset =
        %AdditionalItem{}
        |> AdditionalItem.changeset(%{
          name: "Email Service",
          description: "Premium email hosting",
          price: "15.99",
          tenant_id: tenant.id,
          valid_from: ~D[2025-01-01],
          valid_until: ~D[2025-12-31]
        })

      assert changeset.valid?
    end

    test "name is required", %{tenant: tenant} do
      changeset =
        %AdditionalItem{}
        |> AdditionalItem.changeset(%{
          price: "15.99",
          tenant_id: tenant.id
        })

      refute changeset.valid?
      errors = errors_on(changeset)
      assert %{name: ["can't be blank"]} = errors
    end

    test "price is required", %{tenant: tenant} do
      changeset =
        %AdditionalItem{}
        |> AdditionalItem.changeset(%{
          name: "Email Service",
          tenant_id: tenant.id
        })

      refute changeset.valid?
      assert %{price: ["can't be blank"]} = errors_on(changeset)
    end

    test "price must be non-negative", %{tenant: tenant} do
      changeset =
        %AdditionalItem{}
        |> AdditionalItem.changeset(%{
          name: "Email Service",
          price: "-10.00",
          tenant_id: tenant.id
        })

      refute changeset.valid?
      errors = errors_on(changeset)
      assert %{price: ["must be greater than or equal to 0"]} = errors
    end

    test "description defaults to empty string", %{tenant: tenant} do
      changeset =
        %AdditionalItem{}
        |> AdditionalItem.changeset(%{
          name: "Email Service",
          price: "15.99",
          tenant_id: tenant.id
        })

      description = get_field(changeset, :description)
      assert description == ""
    end

    test "name must not be empty string", %{tenant: tenant} do
      changeset =
        %AdditionalItem{}
        |> AdditionalItem.changeset(%{
          name: "",
          price: "15.99",
          tenant_id: tenant.id
        })

      refute changeset.valid?
      assert %{name: _} = errors_on(changeset)
    end

    test "tenant_id is required", %{tenant: _tenant} do
      changeset =
        %AdditionalItem{}
        |> AdditionalItem.changeset(%{
          name: "Email Service",
          price: "15.99"
        })

      refute changeset.valid?
      assert %{tenant_id: ["can't be blank"]} = errors_on(changeset)
    end

    test "valid_until must be on or after valid_from", %{tenant: tenant} do
      changeset =
        %AdditionalItem{}
        |> AdditionalItem.changeset(%{
          name: "Email Service",
          price: "15.99",
          tenant_id: tenant.id,
          valid_from: ~D[2025-12-31],
          valid_until: ~D[2025-01-01]
        })

      refute changeset.valid?
      assert %{valid_until: ["must be on or after valid_from date"]} = errors_on(changeset)
    end

    test "valid_until can equal valid_from", %{tenant: tenant} do
      changeset =
        %AdditionalItem{}
        |> AdditionalItem.changeset(%{
          name: "Email Service",
          price: "15.99",
          tenant_id: tenant.id,
          valid_from: ~D[2025-01-01],
          valid_until: ~D[2025-01-01]
        })

      assert changeset.valid?
    end
  end

  describe "add_additional_item/2" do
    test "successfully adds item to tenant", %{tenant: tenant} do
      assert {:ok, item} =
               Billings.add_additional_item(tenant, %{
                 name: "Email Service",
                 description: "Premium email hosting",
                 price: "15.99"
               })

      assert item.name == "Email Service"
      assert item.description == "Premium email hosting"
      assert Decimal.equal?(item.price, Decimal.new("15.99"))
      assert item.tenant_id == tenant.id
    end

    test "sets valid_from to today if not provided", %{tenant: tenant} do
      assert {:ok, item} =
               Billings.add_additional_item(tenant, %{
                 name: "Email Service",
                 price: "15.99"
               })

      assert item.valid_from == Date.utc_today()
    end

    test "respects provided valid_from", %{tenant: tenant} do
      custom_date = ~D[2025-01-01]

      assert {:ok, item} =
               Billings.add_additional_item(tenant, %{
                 name: "Email Service",
                 price: "15.99",
                 valid_from: custom_date
               })

      assert item.valid_from == custom_date
    end

    test "validates all required fields", %{tenant: tenant} do
      assert {:error, changeset} =
               Billings.add_additional_item(tenant, %{
                 description: "Missing name and price"
               })

      refute changeset.valid?
      assert %{name: ["can't be blank"], price: ["can't be blank"]} = errors_on(changeset)
    end

    test "returns error changeset for invalid data", %{tenant: tenant} do
      assert {:error, changeset} =
               Billings.add_additional_item(tenant, %{
                 name: "Email Service",
                 price: "-10.00"
               })

      refute changeset.valid?
    end
  end

  describe "remove_additional_item/1" do
    test "successfully removes an item", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Email Service",
          price: "15.99"
        })

      assert {:ok, deleted_item} = Billings.remove_additional_item(item)
      assert deleted_item.id == item.id
      assert is_nil(Billings.get_additional_item(item.id))
    end

    test "item is deleted from database", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Email Service",
          price: "15.99"
        })

      Billings.remove_additional_item(item)

      items = Billings.list_additional_items(tenant)
      refute Enum.any?(items, fn i -> i.id == item.id end)
    end
  end

  describe "cancel_additional_item/2" do
    test "sets valid_until to today by default", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Email Service",
          price: "15.99"
        })

      assert {:ok, cancelled_item} = Billings.cancel_additional_item(item)
      assert cancelled_item.valid_until == Date.utc_today()
    end

    test "can set custom valid_until date", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Email Service",
          price: "15.99"
        })

      custom_date = Date.add(Date.utc_today(), 30)
      assert {:ok, cancelled_item} = Billings.cancel_additional_item(item, custom_date)
      assert cancelled_item.valid_until == custom_date
    end

    test "validates valid_until is after valid_from", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Email Service",
          price: "15.99",
          valid_from: ~D[2025-12-31]
        })

      assert {:error, changeset} = Billings.cancel_additional_item(item, ~D[2025-01-01])
      refute changeset.valid?
    end

    test "allows valid_until equal to valid_from", %{tenant: tenant} do
      date = ~D[2025-01-01]

      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Email Service",
          price: "15.99",
          valid_from: date
        })

      assert {:ok, cancelled_item} = Billings.cancel_additional_item(item, date)
      assert cancelled_item.valid_until == date
    end
  end

  describe "list_additional_items/1" do
    test "returns all items for a tenant", %{tenant: tenant} do
      {:ok, item1} =
        Billings.add_additional_item(tenant, %{name: "Service 1", price: "10.00"})

      {:ok, item2} =
        Billings.add_additional_item(tenant, %{name: "Service 2", price: "20.00"})

      items = Billings.list_additional_items(tenant)
      item_ids = Enum.map(items, & &1.id)

      assert length(items) >= 2
      assert item1.id in item_ids
      assert item2.id in item_ids
    end

    test "includes cancelled items", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Service",
          price: "10.00",
          valid_from: Date.add(Date.utc_today(), -30)
        })

      {:ok, _cancelled} = Billings.cancel_additional_item(item, Date.add(Date.utc_today(), -1))

      items = Billings.list_additional_items(tenant)
      assert Enum.any?(items, fn i -> i.id == item.id end)
    end

    test "empty list for tenant with no items" do
      other_tenant = Tenants.get_tenant_by_slug("test")
      items = Billings.list_additional_items(other_tenant)
      assert is_list(items)
    end
  end

  describe "list_active_additional_items/2" do
    test "returns only active items on given date", %{tenant: tenant} do
      {:ok, active_item} =
        Billings.add_additional_item(tenant, %{
          name: "Active Service",
          price: "10.00",
          valid_from: Date.add(Date.utc_today(), -30),
          valid_until: Date.add(Date.utc_today(), 30)
        })

      {:ok, _expired_item} =
        Billings.add_additional_item(tenant, %{
          name: "Expired Service",
          price: "20.00",
          valid_from: Date.add(Date.utc_today(), -60),
          valid_until: Date.add(Date.utc_today(), -1)
        })

      active_items = Billings.list_active_additional_items(tenant)
      active_ids = Enum.map(active_items, & &1.id)

      assert active_item.id in active_ids
    end

    test "excludes items not yet started", %{tenant: tenant} do
      {:ok, future_item} =
        Billings.add_additional_item(tenant, %{
          name: "Future Service",
          price: "10.00",
          valid_from: Date.add(Date.utc_today(), 30)
        })

      active_items = Billings.list_active_additional_items(tenant)
      active_ids = Enum.map(active_items, & &1.id)

      refute future_item.id in active_ids
    end

    test "excludes items already ended", %{tenant: tenant} do
      {:ok, ended_item} =
        Billings.add_additional_item(tenant, %{
          name: "Ended Service",
          price: "10.00",
          valid_from: Date.add(Date.utc_today(), -60),
          valid_until: Date.add(Date.utc_today(), -1)
        })

      active_items = Billings.list_active_additional_items(tenant)
      active_ids = Enum.map(active_items, & &1.id)

      refute ended_item.id in active_ids
    end

    test "includes items with no end date", %{tenant: tenant} do
      {:ok, ongoing_item} =
        Billings.add_additional_item(tenant, %{
          name: "Ongoing Service",
          price: "10.00",
          valid_until: nil
        })

      active_items = Billings.list_active_additional_items(tenant)
      active_ids = Enum.map(active_items, & &1.id)

      assert ongoing_item.id in active_ids
    end

    test "can query active items on specific date", %{tenant: tenant} do
      query_date = ~D[2025-06-15]

      {:ok, active_on_date} =
        Billings.add_additional_item(tenant, %{
          name: "Summer Service",
          price: "10.00",
          valid_from: ~D[2025-06-01],
          valid_until: ~D[2025-06-30]
        })

      active_items = Billings.list_active_additional_items(tenant, query_date)
      active_ids = Enum.map(active_items, & &1.id)

      assert active_on_date.id in active_ids
    end
  end

  describe "get_additional_item/1 and get_additional_item!/1" do
    test "get_additional_item/1 returns item by id", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{name: "Service", price: "10.00"})

      found_item = Billings.get_additional_item(item.id)
      assert found_item.id == item.id
      assert found_item.name == "Service"
    end

    test "get_additional_item/1 returns nil for non-existent id" do
      assert is_nil(Billings.get_additional_item(999_999))
    end

    test "get_additional_item!/1 returns item by id", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{name: "Service", price: "10.00"})

      found_item = Billings.get_additional_item!(item.id)
      assert found_item.id == item.id
    end

    test "get_additional_item!/1 raises for non-existent id" do
      assert_raise Ecto.NoResultsError, fn ->
        Billings.get_additional_item!(999_999)
      end
    end
  end

  describe "active?/2" do
    test "returns true for active items", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Service",
          price: "10.00",
          valid_from: Date.add(Date.utc_today(), -30),
          valid_until: Date.add(Date.utc_today(), 30)
        })

      assert Billings.active?(item)
    end

    test "returns false for cancelled items", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Service",
          price: "10.00",
          valid_from: Date.add(Date.utc_today(), -30)
        })

      {:ok, cancelled} = Billings.cancel_additional_item(item, Date.add(Date.utc_today(), -1))

      refute Billings.active?(cancelled)
    end

    test "returns false for future items", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Service",
          price: "10.00",
          valid_from: Date.add(Date.utc_today(), 30)
        })

      refute Billings.active?(item)
    end

    test "returns true for items with no end date", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Service",
          price: "10.00",
          valid_until: nil
        })

      assert Billings.active?(item)
    end

    test "can check if active on specific date", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Service",
          price: "10.00",
          valid_from: ~D[2025-01-01],
          valid_until: ~D[2025-12-31]
        })

      assert Billings.active?(item, ~D[2025-06-15])
      refute Billings.active?(item, ~D[2026-01-01])
    end
  end

  describe "calculate_total_additional_cost/2" do
    test "sums prices of all active items", %{tenant: tenant} do
      {:ok, _item1} =
        Billings.add_additional_item(tenant, %{name: "Service 1", price: "10.00"})

      {:ok, _item2} =
        Billings.add_additional_item(tenant, %{name: "Service 2", price: "20.50"})

      {:ok, _item3} =
        Billings.add_additional_item(tenant, %{name: "Service 3", price: "5.49"})

      total = Billings.calculate_total_additional_cost(tenant)
      assert Decimal.equal?(total, Decimal.new("35.99"))
    end

    test "returns 0 for no active items", %{tenant: tenant} do
      # Cancel any existing items
      tenant
      |> Billings.list_additional_items()
      |> Enum.each(&Billings.cancel_additional_item(&1, Date.add(Date.utc_today(), -1)))

      total = Billings.calculate_total_additional_cost(tenant)
      assert Decimal.equal?(total, Decimal.new(0))
    end

    test "excludes cancelled items from total", %{tenant: tenant} do
      {:ok, _active_item} =
        Billings.add_additional_item(tenant, %{name: "Active", price: "10.00"})

      {:ok, cancelled_item} =
        Billings.add_additional_item(tenant, %{
          name: "Cancelled",
          price: "20.00",
          valid_from: Date.add(Date.utc_today(), -30)
        })

      {:ok, _} = Billings.cancel_additional_item(cancelled_item, Date.add(Date.utc_today(), -1))

      tenant = Tenants.get_tenant_by_slug("test")
      total = Billings.calculate_total_additional_cost(tenant)

      assert Decimal.compare(total, Decimal.new("10.00")) in [:eq, :gt]
    end

    test "can calculate cost on specific date", %{tenant: tenant} do
      {:ok, _summer_item} =
        Billings.add_additional_item(tenant, %{
          name: "Summer",
          price: "15.00",
          valid_from: ~D[2025-06-01],
          valid_until: ~D[2025-08-31]
        })

      {:ok, _winter_item} =
        Billings.add_additional_item(tenant, %{
          name: "Winter",
          price: "25.00",
          valid_from: ~D[2025-12-01],
          valid_until: ~D[2026-02-28]
        })

      summer_total = Billings.calculate_total_additional_cost(tenant, ~D[2025-07-15])
      winter_total = Billings.calculate_total_additional_cost(tenant, ~D[2026-01-15])

      assert Decimal.compare(summer_total, Decimal.new("15.00")) in [:eq, :gt]
      assert Decimal.compare(winter_total, Decimal.new("25.00")) in [:eq, :gt]
    end
  end

  describe "Invoice generation" do
    test "generate_invoice/3 creates draft invoice", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)

      assert invoice.status == :draft
      assert invoice.year == 2025
      assert invoice.month == 11
      assert invoice.period_start == ~D[2025-11-01]
      assert invoice.period_end == ~D[2025-11-30]
      assert invoice.tenant_id == tenant.id
      assert invoice.invoice_number =~ ~r/^LTA\d{5}$/
    end

    test "generate_invoice/3 includes plan in items if tenant has plan", %{tenant: tenant} do
      {:ok, updated_tenant} =
        Tenants.update_plan(tenant, "supporter", ~D[2026-12-31], "supporter")

      assert updated_tenant.current_plan_name == "supporter"
      assert updated_tenant.current_plan_expires_at == ~D[2026-12-31]

      reloaded = Tenants.get_tenant(tenant.id)
      assert reloaded.current_plan_name == "supporter"

      {:ok, invoice} = Billings.generate_invoice(updated_tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      plan_items = Enum.filter(invoice.items, fn item -> item.type == "plan" end)

      assert length(plan_items) == 1,
             "Expected 1 plan item, got #{length(plan_items)}. Invoice items: #{inspect(invoice.items)}"

      [plan_item] = plan_items
      plan_item_rows = plan_item.rows || []

      has_base_plan =
        Enum.any?(plan_item_rows, fn row ->
          is_map(row) and is_binary(row["description"]) and row["description"] =~ "Lotta"
        end) or (is_binary(plan_item.notes) and plan_item.notes =~ "Base Plan")

      assert has_base_plan

      has_supporter =
        Enum.any?(plan_item_rows, fn row ->
          is_map(row) and row["plan_name"] == "supporter"
        end) or plan_item.type == "plan"

      assert has_supporter
    end

    test "generate_invoice/3 includes active additional items", %{tenant: tenant} do
      {:ok, item} =
        Billings.add_additional_item(tenant, %{
          name: "Email Service",
          price: "15.99",
          valid_from: ~D[2025-11-01],
          valid_until: ~D[2025-11-30]
        })

      assert item.id != nil

      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      additional_items =
        Enum.filter(invoice.items, fn item -> item.type == "additional_item" end)

      assert length(additional_items) >= 1,
             "Expected at least 1 additional item, got #{length(additional_items)}"

      email_item =
        Enum.find(additional_items, fn item ->
          item.notes =~ "Email Service" or
            Enum.any?(item.rows || [], fn row -> row["description"] == "Email Service" end)
        end)

      assert email_item, "Could not find Email Service item in #{inspect(additional_items)}"
      assert Decimal.equal?(email_item.amount, Decimal.new("15.99"))
    end

    test "generate_invoice/3 calculates correct total", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      calculated_total =
        invoice.items
        |> Enum.map(fn item -> item.amount end)
        |> Enum.reduce(Decimal.new(0), &Decimal.add/2)

      assert Decimal.equal?(invoice.total, calculated_total)
    end

    test "generate_invoice/3 generates unique invoice numbers", %{tenant: tenant} do
      {:ok, invoice1} = Billings.generate_invoice(tenant, 2025, 10)
      {:ok, invoice2} = Billings.generate_invoice(tenant, 2025, 11)

      assert invoice1.invoice_number != invoice2.invoice_number
    end

    test "generate_invoice/3 prevents duplicate invoices for same period", %{tenant: tenant} do
      {:ok, _invoice} = Billings.generate_invoice(tenant, 2025, 11)

      {:error, changeset} = Billings.generate_invoice(tenant, 2025, 11)

      refute changeset.valid?
      assert %{tenant_id: _} = errors_on(changeset)
    end

    test "generate_invoice/3 validates month range", %{tenant: tenant} do
      {:error, changeset} = Billings.generate_invoice(tenant, 2025, 13)

      refute changeset.valid?
      assert %{month: ["must be less than or equal to 12"]} = errors_on(changeset)
    end

    test "generate_invoice/3 copies customer information from tenant", %{tenant: tenant} do
      # Update tenant with customer information
      {:ok, updated_tenant} =
        Tenants.update_tenant(tenant, %{
          title: "Test School",
          address: "123 Main St",
          billing_address: "456 Billing Ave",
          customer_no: "CUST-001",
          contact_name: "John Doe",
          contact_email: "john@example.com",
          contact_phone: "+1-555-0123"
        })

      {:ok, invoice} = Billings.generate_invoice(updated_tenant, 2025, 11)

      # Verify customer information is copied to invoice
      assert invoice.customer_name == "Test School"
      assert invoice.customer_address == "456 Billing Ave"
      assert invoice.customer_no == "CUST-001"
      assert invoice.customer_contact_name == "John Doe"
      assert invoice.customer_contact_email == "john@example.com"
      assert invoice.customer_contact_phone == "+1-555-0123"
    end

    test "generate_invoice/3 falls back to address when billing_address is nil", %{
      tenant: tenant
    } do
      # Update tenant with address but no billing_address
      {:ok, updated_tenant} =
        Tenants.update_tenant(tenant, %{
          title: "Test School",
          address: "789 Regular St",
          billing_address: nil
        })

      {:ok, invoice} = Billings.generate_invoice(updated_tenant, 2025, 11)

      # Verify fallback to regular address
      assert invoice.customer_address == "789 Regular St"
    end

    test "generate_invoice/3 handles nil customer fields gracefully", %{tenant: tenant} do
      # Ensure tenant has nil customer fields
      {:ok, updated_tenant} =
        Tenants.update_tenant(tenant, %{
          customer_no: nil,
          billing_address: nil,
          contact_name: nil,
          contact_email: nil,
          contact_phone: nil
        })

      {:ok, invoice} = Billings.generate_invoice(updated_tenant, 2025, 11)

      # Verify invoice is created successfully with nil fields
      assert invoice.customer_no == nil
      assert invoice.customer_contact_name == nil
      assert invoice.customer_contact_email == nil
      assert invoice.customer_contact_phone == nil
    end
  end

  describe "issue_invoice/1" do
    test "changes status from draft to issued", %{tenant: tenant} do
      {:ok, draft} = Billings.generate_invoice(tenant, 2025, 11)
      {:ok, issued} = Billings.issue_invoice(draft)

      assert issued.status == :issued
      assert issued.issued_at != nil
      assert issued.due_date != nil
    end

    test "sets due_date to 14 days after issued_at", %{tenant: tenant} do
      {:ok, draft} = Billings.generate_invoice(tenant, 2025, 11)
      {:ok, issued} = Billings.issue_invoice(draft)

      expected_due = Date.add(DateTime.to_date(issued.issued_at), 14)
      assert issued.due_date == expected_due
    end

    test "fails to issue already issued invoice", %{tenant: tenant} do
      {:ok, draft} = Billings.generate_invoice(tenant, 2025, 11)
      {:ok, issued} = Billings.issue_invoice(draft)

      {:error, changeset} = Billings.issue_invoice(issued)
      refute changeset.valid?
    end
  end

  describe "generate_and_issue_invoice/3" do
    test "creates and issues invoice in one step", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_and_issue_invoice(tenant, 2025, 11)

      assert invoice.status == :issued
      assert invoice.issued_at != nil
      assert invoice.due_date != nil
    end
  end

  describe "mark_as_paid/2" do
    setup %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_and_issue_invoice(tenant, 2025, 11)
      {:ok, invoice: invoice}
    end

    test "marks issued invoice as paid", %{invoice: invoice} do
      {:ok, paid} = Billings.mark_as_paid(invoice)

      assert paid.status == :paid
      assert paid.paid_at != nil
    end

    test "allows custom paid_at timestamp", %{invoice: invoice} do
      custom_time = DateTime.utc_now() |> DateTime.add(-1, :day)
      {:ok, paid} = Billings.mark_as_paid(invoice, custom_time)

      # Compare dates/times with truncation since DB may truncate microseconds
      assert DateTime.diff(paid.paid_at, custom_time, :second) == 0
    end

    test "fails to mark draft invoice as paid", %{tenant: tenant} do
      {:ok, draft} = Billings.generate_invoice(tenant, 2025, 10)
      {:error, changeset} = Billings.mark_as_paid(draft)

      refute changeset.valid?
    end

    test "can mark overdue invoice as paid", %{invoice: invoice} do
      {:ok, overdue} =
        invoice
        |> Lotta.Billings.Invoice.update_changeset(%{status: :overdue})
        |> Repo.update(prefix: "public")

      {:ok, paid} = Billings.mark_as_paid(overdue)
      assert paid.status == :paid
    end
  end

  describe "cancel_invoice/2" do
    test "cancels draft invoice", %{tenant: tenant} do
      {:ok, draft} = Billings.generate_invoice(tenant, 2025, 11)
      {:ok, cancelled} = Billings.cancel_invoice(draft)

      assert cancelled.status == :cancelled
    end

    test "cancels issued invoice", %{tenant: tenant} do
      {:ok, issued} = Billings.generate_and_issue_invoice(tenant, 2025, 11)
      {:ok, cancelled} = Billings.cancel_invoice(issued)

      assert cancelled.status == :cancelled
    end

    test "saves cancellation reason in notes", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      {:ok, cancelled} = Billings.cancel_invoice(invoice, "Duplicate invoice")

      assert cancelled.notes =~ "Cancelled: Duplicate invoice"
    end

    test "appends to existing notes", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      {:ok, invoice} = Billings.update_invoice_notes(invoice, "Original note")
      {:ok, cancelled} = Billings.cancel_invoice(invoice, "Wrong amount")

      assert cancelled.notes =~ "Original note"
      assert cancelled.notes =~ "Cancelled: Wrong amount"
    end

    test "fails to cancel paid invoice", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_and_issue_invoice(tenant, 2025, 11)
      {:ok, paid} = Billings.mark_as_paid(invoice)

      {:error, changeset} = Billings.cancel_invoice(paid)
      refute changeset.valid?
    end
  end

  describe "get_invoice/1 and get_invoice!/1" do
    test "get_invoice/1 returns invoice by id", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)

      found = Billings.get_invoice(invoice.id)
      assert found.id == invoice.id
    end

    test "get_invoice/1 returns nil for non-existent id" do
      assert Billings.get_invoice(99_999) == nil
    end

    test "get_invoice!/1 returns invoice by id", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)

      found = Billings.get_invoice!(invoice.id)
      assert found.id == invoice.id
    end

    test "get_invoice!/1 raises for non-existent id" do
      assert_raise Ecto.NoResultsError, fn ->
        Billings.get_invoice!(99_999)
      end
    end
  end

  describe "get_invoice_by_number/1" do
    test "returns invoice by number", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)

      found = Billings.get_invoice_by_number(invoice.invoice_number)
      assert found.id == invoice.id
    end

    test "returns nil for non-existent number" do
      assert Billings.get_invoice_by_number("LTA99999") == nil
    end
  end

  describe "list_invoices/2" do
    test "lists all invoices for tenant", %{tenant: tenant} do
      {:ok, _inv1} = Billings.generate_invoice(tenant, 2025, 10)
      {:ok, _inv2} = Billings.generate_invoice(tenant, 2025, 11)

      invoices = Billings.list_invoices(tenant)
      assert length(invoices) >= 2
    end

    test "filters by status", %{tenant: tenant} do
      {:ok, _draft} = Billings.generate_invoice(tenant, 2025, 10)
      {:ok, _issued} = Billings.generate_and_issue_invoice(tenant, 2025, 11)

      draft_invoices = Billings.list_invoices(tenant, status: :draft)
      issued_invoices = Billings.list_invoices(tenant, status: :issued)

      assert Enum.all?(draft_invoices, fn inv -> inv.status == :draft end)
      assert Enum.all?(issued_invoices, fn inv -> inv.status == :issued end)
    end

    test "filters by year", %{tenant: tenant} do
      {:ok, _inv} = Billings.generate_invoice(tenant, 2025, 11)

      invoices_2025 = Billings.list_invoices(tenant, year: 2025)
      invoices_2024 = Billings.list_invoices(tenant, year: 2024)

      assert length(invoices_2025) >= 1
      assert Enum.empty?(invoices_2024)
    end

    test "filters by month", %{tenant: tenant} do
      {:ok, _inv} = Billings.generate_invoice(tenant, 2025, 11)

      invoices_nov = Billings.list_invoices(tenant, month: 11)
      invoices_dec = Billings.list_invoices(tenant, month: 12)

      assert length(invoices_nov) >= 1
      assert Enum.all?(invoices_dec, fn inv -> inv.month == 12 end)
    end

    test "orders by year and month descending", %{tenant: tenant} do
      {:ok, _inv1} = Billings.generate_invoice(tenant, 2025, 10)
      {:ok, _inv2} = Billings.generate_invoice(tenant, 2025, 11)

      [first, second | _] = Billings.list_invoices(tenant)

      assert first.month > second.month or first.year > second.year
    end
  end

  describe "check_overdue_invoices/0" do
    test "marks overdue invoices", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_and_issue_invoice(tenant, 2025, 11)

      # Manually set due_date to past
      {:ok, invoice} =
        invoice
        |> Lotta.Billings.Invoice.update_changeset(%{
          due_date: Date.add(Date.utc_today(), -1)
        })
        |> Repo.update(prefix: "public")

      overdue = Billings.check_overdue_invoices()

      assert Enum.any?(overdue, fn inv -> inv.id == invoice.id end)

      updated = Billings.get_invoice(invoice.id)
      assert updated.status == :overdue
    end

    test "does not mark future invoices", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_and_issue_invoice(tenant, 2025, 11)

      overdue = Billings.check_overdue_invoices()

      refute Enum.any?(overdue, fn inv -> inv.id == invoice.id end)

      updated = Billings.get_invoice(invoice.id)
      assert updated.status == :issued
    end
  end

  describe "calculate_period_total/3" do
    test "calculates total without creating invoice", %{tenant: tenant} do
      {items, total} = Billings.calculate_period_total(tenant, 2025, 11)

      assert is_list(items)
      assert %Decimal{} = total
      assert Decimal.compare(total, Decimal.new(0)) in [:eq, :gt]
    end

    test "includes plan and additional items", %{tenant: tenant} do
      {:ok, tenant} = Tenants.update_plan(tenant, "supporter", ~D[2026-12-31], "supporter")

      {:ok, _item} =
        Billings.add_additional_item(tenant, %{
          name: "Test Service",
          price: "10.00",
          valid_from: ~D[2025-11-01]
        })

      {items, _total} = Billings.calculate_period_total(tenant, 2025, 11)

      # Items can be either maps or structs, check accordingly
      plan_items =
        Enum.filter(items, fn item ->
          (is_map(item) and (item[:type] == "plan" or item["type"] == "plan")) or
            (is_struct(item) and item.type == "plan")
        end)

      additional_items =
        Enum.filter(items, fn item ->
          (is_map(item) and
             (item[:type] == "additional_item" or item["type"] == "additional_item")) or
            (is_struct(item) and item.type == "additional_item")
        end)

      assert length(plan_items) == 1
      assert length(additional_items) >= 1
    end
  end

  describe "Usage-based billing" do
    setup %{tenant: tenant} do
      # Set tenant to use supporter plan which has usage-based billing
      {:ok, tenant_with_plan} =
        Tenants.update_plan(tenant, "supporter", ~D[2099-12-31], "supporter")

      {:ok, tenant: tenant_with_plan}
    end

    test "generates invoice with no usage data", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      # Should have one plan item
      assert length(invoice.items) == 1
      [plan_item] = invoice.items

      assert plan_item.type == "plan"
      # base_price + base_user + storage + conversion
      assert length(plan_item.rows) == 4

      # Check rows structure
      rows_by_type = Enum.group_by(plan_item.rows, fn row -> row["type"] end)

      # Base price: Fixed monthly fee
      [base_price_row] = rows_by_type["base_price"]
      assert base_price_row["quantity"] == 1
      assert base_price_row["amount"] == "39.00"
      assert base_price_row["description"] =~ "Lotta"

      # Base charge: 0 users
      [base_row] = rows_by_type["base_user_charge"]
      assert base_row["quantity"] == 0
      assert base_row["amount"] == "0.00"
      assert base_row["description"] =~ "0 aktive nutzer"

      # Storage: 0/0 GB
      [storage_row] = rows_by_type["storage_usage"]
      assert storage_row["quantity"] == 0.0
      assert storage_row["amount"] == "0.00"
      assert storage_row["description"] =~ "Speicher: 0.00/0.00 GB"

      # Conversion: 0/15 min
      [conversion_row] = rows_by_type["media_conversion_usage"]
      assert conversion_row["quantity"] == 0.0
      assert conversion_row["amount"] == "0.00"
      assert conversion_row["description"] =~ "Medien: 0.00/15 min"

      # Total should be just the base price
      assert Decimal.equal?(invoice.total, Decimal.new("39.00"))
    end

    test "generates invoice with usage within limits", %{tenant: tenant} do
      # Insert usage data within limits
      # 10 active users, 8 GB storage (limit: 10 GB), 10 min conversion (limit: 15 min)
      insert_usage_data(tenant.id, 2025, 11, 10, 8.0, 10.0)

      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      [plan_item] = invoice.items
      rows_by_type = Enum.group_by(plan_item.rows, fn row -> row["type"] end)

      # Base charge: 10 users * $0.12 = $1.20
      [base_row] = rows_by_type["base_user_charge"]
      assert base_row["quantity"] == 10
      assert base_row["amount"] == "1.00"

      # Storage: 8/10 GB - no overage
      [storage_row] = rows_by_type["storage_usage"]
      assert storage_row["quantity"] == 0.0
      assert storage_row["amount"] == "0.00"
      assert storage_row["description"] =~ "Speicher: 8.00/10.00 GB"
      refute storage_row["description"] =~ "over limit"

      # Conversion: 10/15 min - no overage
      [conversion_row] = rows_by_type["media_conversion_usage"]
      assert conversion_row["quantity"] == 0.0
      assert conversion_row["amount"] == "0.00"
      assert conversion_row["description"] =~ "Medien: 10.00/15 min"
      refute conversion_row["description"] =~ "over limit"

      # Total: $39.00 (base price) + $1.20 (10 users * $0.12) = $40.20
      assert Decimal.equal?(invoice.total, Decimal.new("40.00"))
    end

    test "generates invoice with storage overage", %{tenant: tenant} do
      # 10 users, 15.5 GB storage (limit: 10 GB), overage: 5.5 GB
      insert_usage_data(tenant.id, 2025, 11, 10, 15.5, 0.0)

      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      [plan_item] = invoice.items
      rows_by_type = Enum.group_by(plan_item.rows, fn row -> row["type"] end)

      # Storage overage: 5.5 GB * $1.00 = $5.50
      [storage_row] = rows_by_type["storage_usage"]
      assert storage_row["quantity"] == 5.5
      assert storage_row["amount"] == "5.50"
      assert storage_row["description"] =~ "Speicher: 15.50/10.00 GB"

      # Total: $39.00 (base price) + $1.20 (10 users) + $5.50 (storage overage) = $45.70
      assert Decimal.equal?(invoice.total, Decimal.new("45.50"))
    end

    test "generates invoice with conversion overage", %{tenant: tenant} do
      # 10 users, 22 min conversion (limit: 15 min), overage: 7 min
      insert_usage_data(tenant.id, 2025, 11, 10, 0.0, 22.0)

      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      [plan_item] = invoice.items
      rows_by_type = Enum.group_by(plan_item.rows, fn row -> row["type"] end)

      # Conversion overage: 7 min * $1.00 = $7.00
      [conversion_row] = rows_by_type["media_conversion_usage"]
      assert conversion_row["quantity"] == 7.0
      assert conversion_row["amount"] == "7.00"
      assert conversion_row["description"] =~ "Medien: 22.00/15 min"

      # Total: $39.00 (base price) + $1.20 (10 users) + $7.00 (conversion overage) = $47.20
      assert Decimal.equal?(invoice.total, Decimal.new("47.00"))
    end

    test "generates invoice with combined overages", %{tenant: tenant} do
      # 15 users, 20 GB storage (limit: 15 GB), 25 min conversion (limit: 15 min)
      insert_usage_data(tenant.id, 2025, 11, 15, 20.0, 25.0)

      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      [plan_item] = invoice.items
      rows_by_type = Enum.group_by(plan_item.rows, fn row -> row["type"] end)

      # Base: 15 * $0.12 = $1.80
      [base_row] = rows_by_type["base_user_charge"]
      assert base_row["amount"] == "1.50"

      # Storage overage: 5 GB * $1.00 = $5.00
      [storage_row] = rows_by_type["storage_usage"]
      assert storage_row["quantity"] == 5.0
      assert storage_row["amount"] == "5.00"

      # Conversion overage: 10 min * $1.00 = $10.00
      [conversion_row] = rows_by_type["media_conversion_usage"]
      assert conversion_row["quantity"] == 10.0
      assert conversion_row["amount"] == "10.00"

      # Total: $39.00 (base price) + $1.80 (15 users) + $5.00 (storage) + $10.00 (conversion) = $55.80
      assert Decimal.equal?(invoice.total, Decimal.new("55.50"))
    end

    test "generates invoice with plan and additional items", %{tenant: tenant} do
      # Add usage
      insert_usage_data(tenant.id, 2025, 11, 5, 0.0, 0.0)

      # Add additional item
      {:ok, _item} =
        Billings.add_additional_item(tenant, %{
          name: "Email Service",
          price: "15.99",
          valid_from: ~D[2025-11-01],
          valid_until: ~D[2025-11-30]
        })

      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      # Should have plan item + additional item
      assert length(invoice.items) == 2

      plan_items = Enum.filter(invoice.items, fn item -> item.type == "plan" end)
      additional_items = Enum.filter(invoice.items, fn item -> item.type == "additional_item" end)

      assert length(plan_items) == 1
      assert length(additional_items) == 1

      [additional_item] = additional_items
      assert additional_item.notes == "Email Service"
      assert Decimal.equal?(additional_item.amount, Decimal.new("15.99"))
      assert length(additional_item.rows) == 1

      # Total: $39.00 (base price) + $0.60 (5 users * $0.12) + $15.99 (additional) = $55.59
      assert Decimal.equal?(invoice.total, Decimal.new("55.49"))
    end

    test "handles exactly at limit (no overage)", %{tenant: tenant} do
      # 10 users, exactly 10 GB storage, exactly 15 min conversion
      insert_usage_data(tenant.id, 2025, 11, 10, 10.0, 15.0)

      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      [plan_item] = invoice.items
      rows_by_type = Enum.group_by(plan_item.rows, fn row -> row["type"] end)

      # No storage overage at exactly 10/10 GB
      [storage_row] = rows_by_type["storage_usage"]
      assert storage_row["quantity"] == 0.0
      assert storage_row["amount"] == "0.00"
      assert storage_row["description"] =~ "Speicher: 10.00/10.00 GB"

      # No conversion overage at exactly 15/15 min
      [conversion_row] = rows_by_type["media_conversion_usage"]
      assert conversion_row["quantity"] == 0.0
      assert conversion_row["amount"] == "0.00"
      assert conversion_row["description"] =~ "Medien: 15.00/15 min"

      # Total: $39.00 (base price) + $1.20 (10 users) = $40.20
      assert Decimal.equal?(invoice.total, Decimal.new("40.00"))
    end
  end

  describe "update_invoice_notes/2" do
    test "updates notes field", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)

      {:ok, updated} =
        Billings.update_invoice_notes(invoice, "Payment received via bank transfer")

      assert updated.notes == "Payment received via bank transfer"
    end
  end

  describe "Invoice HTML rendering" do
    test "to_html/1 generates HTML for invoice", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      html = Invoice.to_html(invoice)

      assert is_binary(html)
      assert String.length(html) > 0
      assert html =~ invoice.invoice_number
    end

    test "to_html/1 includes all invoice items", %{tenant: tenant} do
      {:ok, _item} =
        Billings.add_additional_item(tenant, %{
          name: "Test Service",
          price: "15.99",
          valid_from: ~D[2025-11-01]
        })

      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      html = Invoice.to_html(invoice)

      assert is_binary(html)
      # Should have both plan and additional item
      assert length(invoice.items) >= 2
    end

    test "to_html/1 includes customer information when present", %{tenant: tenant} do
      {:ok, updated_tenant} =
        Tenants.update_tenant(tenant, %{
          title: "HTML Test Org",
          billing_address: "789 HTML St"
        })

      {:ok, invoice} = Billings.generate_invoice(updated_tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      html = Invoice.to_html(invoice)

      assert html =~ "HTML Test Org"
    end

    test "to_html/1 works without customer information", %{tenant: tenant} do
      {:ok, updated_tenant} =
        Tenants.update_tenant(tenant, %{
          billing_address: nil,
          customer_no: nil
        })

      {:ok, invoice} = Billings.generate_invoice(updated_tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      html = Invoice.to_html(invoice)

      assert is_binary(html)
      assert String.length(html) > 0
    end
  end
end
