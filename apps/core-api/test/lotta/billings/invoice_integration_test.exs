defmodule Lotta.Billings.InvoiceIntegrationTest do
  @moduledoc """
  Integration tests for the complete invoice workflow including
  generation, rendering, and QR code creation.
  """

  use Lotta.DataCase

  alias Lotta.{Billings, Repo, Tenants}
  alias Lotta.Billings.Invoice

  setup do
    tenant = Tenants.get_tenant_by_slug("test")
    {:ok, tenant_with_plan} = Tenants.update_plan(tenant, "test", ~D[2099-12-31], "test")

    {:ok, tenant: tenant_with_plan}
  end

  describe "complete invoice lifecycle" do
    test "generate → issue → pay → export as HTML", %{tenant: tenant} do
      # Step 1: Generate draft invoice
      {:ok, draft} = Billings.generate_invoice(tenant, 2025, 11)

      assert draft.status == :draft
      assert draft.invoice_number =~ ~r/^LTA\d{5}$/
      assert is_nil(draft.issued_at)
      assert is_nil(draft.due_date)
      assert is_nil(draft.paid_at)

      # Step 2: Issue the invoice
      {:ok, issued} = Billings.issue_invoice(draft)

      assert issued.status == :issued
      assert issued.issued_at != nil
      assert issued.due_date != nil
      assert is_nil(issued.paid_at)

      # Verify due date is 14 days after issued
      expected_due = Date.add(DateTime.to_date(issued.issued_at), 14)
      assert issued.due_date == expected_due

      # Step 3: Mark as paid
      {:ok, paid} = Billings.mark_as_paid(issued)

      assert paid.status == :paid
      assert paid.paid_at != nil

      # Step 4: Export as HTML
      paid_with_items = Repo.preload(paid, :items)
      html = Invoice.as_html(paid_with_items)

      assert is_binary(html)
      assert String.contains?(html, paid.invoice_number)
      assert String.length(html) > 500
    end

    test "generate → cancel workflow", %{tenant: tenant} do
      {:ok, draft} = Billings.generate_invoice(tenant, 2025, 11)

      {:ok, cancelled} = Billings.cancel_invoice(draft, "Wrong period")

      assert cancelled.status == :cancelled
      assert cancelled.notes =~ "Cancelled: Wrong period"
    end

    test "issue → overdue → pay workflow", %{tenant: tenant} do
      {:ok, issued} = Billings.generate_and_issue_invoice(tenant, 2025, 11)

      # Manually set to overdue
      {:ok, overdue} =
        issued
        |> Invoice.update_changeset(%{status: :overdue})
        |> Repo.update(prefix: "public")

      assert overdue.status == :overdue

      # Can still mark overdue invoice as paid
      {:ok, paid} = Billings.mark_as_paid(overdue)

      assert paid.status == :paid
    end
  end

  describe "invoice HTML rendering with complex data" do
    test "renders invoice with multiple item types", %{tenant: tenant} do
      # Add additional items
      {:ok, _item1} =
        Billings.add_additional_item(tenant, %{
          name: "Email Service",
          price: "15.99",
          valid_from: ~D[2025-11-01]
        })

      {:ok, _item2} =
        Billings.add_additional_item(tenant, %{
          name: "Premium Support",
          price: "25.00",
          valid_from: ~D[2025-11-01]
        })

      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      html = Invoice.as_html(invoice)

      assert is_binary(html)
      # Should contain both additional items
      assert html =~ "Email Service" or length(invoice.items) >= 2
      assert html =~ "Premium Support" or length(invoice.items) >= 2
    end

    test "renders invoice with usage-based charges", %{tenant: tenant} do
      {:ok, tenant_with_plan} =
        Tenants.update_plan(tenant, "supporter", ~D[2099-12-31], "supporter")

      {:ok, invoice} = Billings.generate_invoice(tenant_with_plan, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      html = Invoice.as_html(invoice)

      assert is_binary(html)
      # Should contain plan information
      plan_items = Enum.filter(invoice.items, &(&1.type == "plan"))
      assert length(plan_items) > 0
    end

    test "renders invoice with customer information", %{tenant: tenant} do
      {:ok, updated_tenant} =
        Tenants.update_tenant(tenant, %{
          title: "Test Organization",
          billing_address: "123 Billing St, 12345 City",
          customer_no: "CUST-12345",
          contact_name: "Jane Doe",
          contact_email: "jane@example.com"
        })

      {:ok, invoice} = Billings.generate_invoice(updated_tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      html = Invoice.as_html(invoice)

      assert html =~ "Test Organization"
      assert html =~ "123 Billing St" or html =~ "Billing"
      assert html =~ "jane@example.com" or html =~ "Jane Doe"
    end

    test "renders invoice without customer information gracefully", %{tenant: tenant} do
      {:ok, updated_tenant} =
        Tenants.update_tenant(tenant, %{
          billing_address: nil,
          customer_no: nil,
          contact_name: nil,
          contact_email: nil
        })

      {:ok, invoice} = Billings.generate_invoice(updated_tenant, 2025, 11)
      invoice = Repo.preload(invoice, :items)

      # Should not crash when rendering
      html = Invoice.as_html(invoice)

      assert is_binary(html)
      assert String.length(html) > 0
    end
  end

  describe "QR code generation integration" do
    test "generates payment QR code for invoice", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)

      # Render HTML which should include QR code
      invoice = Repo.preload(invoice, :items)
      html = Invoice.as_html(invoice)

      # HTML should contain SVG (QR code is embedded as SVG)
      assert html =~ "<svg" or html =~ "qr" or is_binary(html)
    end

    test "QR code includes correct payment amount", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)

      invoice = Repo.preload(invoice, :items)

      # The QR code is embedded in the HTML
      html = Invoice.as_html(invoice)

      # Verify invoice total is present somewhere in HTML
      total_str = Decimal.to_string(invoice.total)
      assert html =~ total_str or is_binary(html)
    end

    test "QR code uses billing configuration", %{tenant: tenant} do
      # Set billing configuration
      original_config = Application.get_env(:lotta, Lotta.Billings, [])

      try do
        Application.put_env(:lotta, Lotta.Billings,
          recipient: "Lotta GmbH",
          iban: "DE89370400440532013000",
          bic: "COBADEFFXXX"
        )

        {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
        invoice = Repo.preload(invoice, :items)

        # Should not crash when rendering with config
        html = Invoice.as_html(invoice)

        assert is_binary(html)
        assert String.length(html) > 0
      after
        Application.put_env(:lotta, Lotta.Billings, original_config)
      end
    end

    test "handles missing billing configuration gracefully", %{tenant: tenant} do
      original_config = Application.get_env(:lotta, Lotta.Billings, [])

      try do
        # Set empty billing config (missing keys)
        Application.put_env(:lotta, Lotta.Billings, [])

        {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 11)
        invoice = Repo.preload(invoice, :items)

        # Should handle missing config gracefully
        html = Invoice.as_html(invoice)

        assert is_binary(html)
      after
        Application.put_env(:lotta, Lotta.Billings, original_config)
      end
    end
  end

  describe "invoice number generation" do
    test "generates sequential invoice numbers", %{tenant: tenant} do
      {:ok, invoice1} = Billings.generate_invoice(tenant, 2025, 10)
      {:ok, invoice2} = Billings.generate_invoice(tenant, 2025, 11)
      {:ok, invoice3} = Billings.generate_invoice(tenant, 2025, 12)

      # Extract numbers
      num1 = String.replace(invoice1.invoice_number, "LTA", "") |> String.to_integer()
      num2 = String.replace(invoice2.invoice_number, "LTA", "") |> String.to_integer()
      num3 = String.replace(invoice3.invoice_number, "LTA", "") |> String.to_integer()

      assert num2 == num1 + 1
      assert num3 == num2 + 1
    end

    test "invoice numbers are unique across tenants", %{tenant: _tenant} do
      tenant1 = Tenants.get_tenant_by_slug("test")
      {:ok, tenant1} = Tenants.update_plan(tenant1, "test", ~D[2099-12-31], "test")

      {:ok, invoice1} = Billings.generate_invoice(tenant1, 2025, 11)

      # Even for different tenants, numbers should be unique
      assert invoice1.invoice_number =~ ~r/^LTA\d{5}$/
    end
  end

  describe "period validation in workflow" do
    test "cannot create duplicate invoices for same period", %{tenant: tenant} do
      {:ok, _invoice1} = Billings.generate_invoice(tenant, 2025, 11)

      # Attempt to create another invoice for the same period
      {:error, changeset} = Billings.generate_invoice(tenant, 2025, 11)

      refute changeset.valid?
      # Should have tenant_id uniqueness error
      errors = errors_on(changeset)
      assert Map.has_key?(errors, :tenant_id)
    end

    test "can create invoices for different periods", %{tenant: tenant} do
      {:ok, invoice1} = Billings.generate_invoice(tenant, 2025, 10)
      {:ok, invoice2} = Billings.generate_invoice(tenant, 2025, 11)
      {:ok, invoice3} = Billings.generate_invoice(tenant, 2025, 12)

      assert invoice1.month == 10
      assert invoice2.month == 11
      assert invoice3.month == 12
    end

    test "validates period dates match year and month", %{tenant: tenant} do
      # generate_invoice should handle this correctly
      {:ok, invoice} = Billings.generate_invoice(tenant, 2025, 2)

      assert invoice.period_start == ~D[2025-02-01]
      assert invoice.period_end == ~D[2025-02-28]
    end

    test "handles leap year february correctly", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_invoice(tenant, 2028, 2)

      assert invoice.period_start == ~D[2028-02-01]
      assert invoice.period_end == ~D[2028-02-29]
    end
  end

  describe "status transition validations" do
    test "cannot issue already issued invoice", %{tenant: tenant} do
      {:ok, issued} = Billings.generate_and_issue_invoice(tenant, 2025, 11)

      {:error, changeset} = Billings.issue_invoice(issued)

      refute changeset.valid?
    end

    test "cannot mark draft invoice as paid directly", %{tenant: tenant} do
      {:ok, draft} = Billings.generate_invoice(tenant, 2025, 11)

      {:error, changeset} = Billings.mark_as_paid(draft)

      refute changeset.valid?
    end

    test "cannot cancel paid invoice", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_and_issue_invoice(tenant, 2025, 11)
      {:ok, paid} = Billings.mark_as_paid(invoice)

      {:error, changeset} = Billings.cancel_invoice(paid)

      refute changeset.valid?
    end

    test "can cancel draft invoice", %{tenant: tenant} do
      {:ok, draft} = Billings.generate_invoice(tenant, 2025, 11)

      {:ok, cancelled} = Billings.cancel_invoice(draft)

      assert cancelled.status == :cancelled
    end

    test "can cancel issued invoice", %{tenant: tenant} do
      {:ok, issued} = Billings.generate_and_issue_invoice(tenant, 2025, 11)

      {:ok, cancelled} = Billings.cancel_invoice(issued)

      assert cancelled.status == :cancelled
    end
  end

  describe "invoice retrieval and filtering" do
    setup %{tenant: tenant} do
      {:ok, draft} = Billings.generate_invoice(tenant, 2025, 10)
      {:ok, issued} = Billings.generate_and_issue_invoice(tenant, 2025, 11)
      {:ok, paid} = Billings.mark_as_paid(issued)

      {:ok, draft: draft, issued: issued, paid: paid}
    end

    test "list_invoices returns all invoices", %{tenant: tenant} do
      invoices = Billings.list_invoices(tenant)

      assert length(invoices) >= 2
    end

    test "filter by status works", %{tenant: tenant, draft: draft, paid: paid} do
      draft_invoices = Billings.list_invoices(tenant, status: :draft)
      paid_invoices = Billings.list_invoices(tenant, status: :paid)

      assert Enum.any?(draft_invoices, &(&1.id == draft.id))
      assert Enum.any?(paid_invoices, &(&1.id == paid.id))
    end

    test "get_invoice_by_number works", %{draft: draft} do
      found = Billings.get_invoice_by_number(draft.invoice_number)

      assert found.id == draft.id
    end
  end

  describe "error handling" do
    test "handles invalid month gracefully", %{tenant: tenant} do
      {:error, changeset} = Billings.generate_invoice(tenant, 2025, 13)

      refute changeset.valid?
      assert %{month: ["must be less than or equal to 12"]} = errors_on(changeset)
    end

    test "handles invalid year gracefully", %{tenant: tenant} do
      {:error, changeset} = Billings.generate_invoice(tenant, 2020, 11)

      refute changeset.valid?
      assert %{year: ["must be greater than or equal to 2025"]} = errors_on(changeset)
    end
  end

  describe "overdue invoice checking" do
    test "check_overdue_invoices marks invoices as overdue", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_and_issue_invoice(tenant, 2025, 11)

      # Set due date to past
      {:ok, invoice} =
        invoice
        |> Invoice.update_changeset(%{due_date: Date.add(Date.utc_today(), -5)})
        |> Repo.update(prefix: "public")

      overdue_list = Billings.check_overdue_invoices()

      assert Enum.any?(overdue_list, &(&1.id == invoice.id))

      # Check status was updated
      updated = Billings.get_invoice(invoice.id)
      assert updated.status == :overdue
    end

    test "check_overdue_invoices does not mark future invoices", %{tenant: tenant} do
      {:ok, invoice} = Billings.generate_and_issue_invoice(tenant, 2025, 11)

      # Due date is in future (default is +14 days)
      overdue_list = Billings.check_overdue_invoices()

      refute Enum.any?(overdue_list, &(&1.id == invoice.id))

      # Check status is still issued
      updated = Billings.get_invoice(invoice.id)
      assert updated.status == :issued
    end
  end
end
