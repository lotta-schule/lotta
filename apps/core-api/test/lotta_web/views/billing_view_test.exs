defmodule LottaWeb.BillingViewTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: true

  alias Lotta.Billings.{Invoice, EpcCode}
  alias Lotta.{Tenants, Repo}

  # Note: BillingView contains private helper functions that are tested
  # indirectly through the invoice HTML rendering integration tests

  describe "template rendering integration" do
    setup do
      tenant = Tenants.get_tenant_by_slug("test")

      {:ok, invoice} =
        Invoice.create_changeset(%{
          invoice_number: "LTA00999",
          tenant_id: tenant.id,
          year: 2025,
          month: 11,
          period_start: ~D[2025-11-01],
          period_end: ~D[2025-11-30],
          total: "100.00",
          status: :issued,
          issued_at: DateTime.utc_now(),
          due_date: Date.utc_today(),
          customer_name: "Integration Test Customer",
          customer_address: "456 Test Ave",
          customer_no: "CUST-999",
          items: [
            %{
              type: "plan",
              period_start: ~D[2025-11-01],
              period_end: ~D[2025-11-30],
              amount: "39.00",
              notes: "Base Plan",
              rows: [
                %{
                  "description" => "Lotta Supporter Plan",
                  "quantity" => 1,
                  "unit_price" => "39.00",
                  "amount" => "39.00",
                  "type" => "base_price"
                }
              ]
            },
            %{
              type: "additional_item",
              period_start: ~D[2025-11-01],
              period_end: ~D[2025-11-30],
              amount: "61.00",
              notes: "Premium Features",
              rows: [
                %{
                  "description" => "Premium Features",
                  "quantity" => 1,
                  "unit_price" => "61.00",
                  "amount" => "61.00",
                  "type" => "additional_item"
                }
              ]
            }
          ]
        })
        |> Repo.insert(prefix: "public")

      invoice = Repo.preload(invoice, :items)
      {:ok, invoice: invoice}
    end

    test "renders complete invoice with all view helpers", %{invoice: invoice} do
      html = Invoice.to_html(invoice)

      assert is_binary(html)
      assert String.contains?(html, invoice.invoice_number)
      assert String.contains?(html, "Integration Test Customer")
    end

    test "renders invoice with usage rows", %{invoice: invoice} do
      # Update invoice with usage-based rows
      updated_rows = [
        %{
          "description" => "Base Plan",
          "quantity" => 1,
          "unit_price" => "39.00",
          "amount" => "39.00",
          "type" => "base_price"
        },
        %{
          "description" => "10 aktive Nutzer",
          "quantity" => 10,
          "unit_price" => "0.10",
          "amount" => "1.20",
          "type" => "base_user_charge",
          "metadata" => %{"active_users" => 10}
        },
        %{
          "description" => "Speicher: 15.00/10.00 GB",
          "quantity" => 5.0,
          "unit_price" => "1.00",
          "amount" => "5.00",
          "type" => "storage_usage",
          "metadata" => %{
            "storage_used_gb" => 15.0,
            "storage_included_gb" => 10.0,
            "storage_overage_gb" => 5.0
          }
        },
        %{
          "description" => "Medien: 20.00/15 min",
          "quantity" => 5.0,
          "unit_price" => "1.00",
          "amount" => "5.00",
          "type" => "media_conversion_usage",
          "metadata" => %{
            "conversion_used_minutes" => 20.0,
            "conversion_included_minutes" => 15,
            "conversion_overage_minutes" => 5.0
          }
        }
      ]

      # Update the first plan item with usage rows
      import Ecto.Query

      # Get the first plan item ID
      plan_item_id =
        from(i in "invoice_items",
          where: i.invoice_id == ^invoice.id and i.type == "plan",
          select: i.id,
          limit: 1
        )
        |> Repo.one(prefix: "public")

      # Update it
      {1, _} =
        from(i in "invoice_items",
          where: i.id == ^plan_item_id
        )
        |> Repo.update_all([set: [rows: updated_rows]], prefix: "public")

      updated_invoice = Repo.get(Invoice, invoice.id, prefix: "public")
      updated_invoice = Repo.preload(updated_invoice, :items, force: true)

      html = Invoice.to_html(updated_invoice)

      assert is_binary(html)
      # Should include storage and conversion descriptions
      assert html =~ "Speicher" or html =~ "storage"
      assert html =~ "Medien" or html =~ "media" or html =~ "conversion"
    end

    test "renders invoice with prices formatted correctly", %{invoice: invoice} do
      html = Invoice.to_html(invoice)

      # Should contain Euro symbol for prices
      assert html =~ "€" or html =~ "EUR"
      # Should contain the total
      assert html =~ "100" or html =~ invoice.total |> Decimal.to_string()
    end

    test "renders invoice with QR code", %{invoice: invoice} do
      html = Invoice.to_html(invoice)

      # Should contain SVG (QR code)
      assert html =~ "<svg" or html =~ "svg"
    end

    test "handles missing customer information gracefully" do
      tenant = Tenants.get_tenant_by_slug("test")

      {:ok, invoice} =
        Invoice.create_changeset(%{
          invoice_number: "LTA01000",
          tenant_id: tenant.id,
          year: 2025,
          month: 10,
          period_start: ~D[2025-10-01],
          period_end: ~D[2025-10-31],
          total: "50.00",
          customer_name: nil,
          customer_address: nil,
          items: [
            %{
              type: "plan",
              period_start: ~D[2025-10-01],
              period_end: ~D[2025-10-31],
              amount: "50.00",
              notes: "Test",
              rows: []
            }
          ]
        })
        |> Repo.insert(prefix: "public")

      invoice = Repo.preload(invoice, :items)
      html = Invoice.to_html(invoice)

      assert is_binary(html)
      assert String.length(html) > 0
    end
  end

  describe "EPC QR code generation" do
    test "generates QR code with correct structure" do
      epc_code =
        EpcCode.new(
          recipient: "Test Company",
          iban: "DE89370400440532013000",
          bic: "COBADEFFXXX",
          purpose: "Test payment",
          amount: Decimal.new("100.00"),
          currency: "EUR"
        )

      svg = EpcCode.to_svg(epc_code)

      assert is_binary(svg)
      assert String.contains?(svg, "<svg")
      assert String.contains?(svg, "</svg>")
      assert String.contains?(svg, "viewBox=")
    end

    test "handles different amounts correctly" do
      for amount <- [Decimal.new("0.01"), Decimal.new("999.99"), Decimal.new("1000.00")] do
        epc_code =
          EpcCode.new(
            recipient: "Test",
            iban: "DE89370400440532013000",
            bic: "COBADEFFXXX",
            purpose: "Test",
            amount: amount,
            currency: "EUR"
          )

        svg = EpcCode.to_svg(epc_code)
        assert is_binary(svg)
        assert String.contains?(svg, "<svg")
      end
    end
  end

  describe "edge cases and error handling" do
    test "renders invoice with zero total" do
      tenant = Tenants.get_tenant_by_slug("test")

      {:ok, invoice} =
        Invoice.create_changeset(%{
          invoice_number: "LTA01001",
          tenant_id: tenant.id,
          year: 2025,
          month: 9,
          period_start: ~D[2025-09-01],
          period_end: ~D[2025-09-30],
          total: "0.00",
          items: [
            %{
              type: "plan",
              period_start: ~D[2025-09-01],
              period_end: ~D[2025-09-30],
              amount: "0.00",
              notes: "Test",
              rows: []
            }
          ]
        })
        |> Repo.insert(prefix: "public")

      invoice = Repo.preload(invoice, :items)
      html = Invoice.to_html(invoice)

      assert is_binary(html)
      assert String.length(html) > 0
    end

    test "renders invoice with very large total" do
      tenant = Tenants.get_tenant_by_slug("test")

      {:ok, invoice} =
        Invoice.create_changeset(%{
          invoice_number: "LTA01002",
          tenant_id: tenant.id,
          year: 2025,
          month: 8,
          period_start: ~D[2025-08-01],
          period_end: ~D[2025-08-31],
          total: "99999.99",
          items: [
            %{
              type: "plan",
              period_start: ~D[2025-08-01],
              period_end: ~D[2025-08-31],
              amount: "99999.99",
              notes: "Test",
              rows: []
            }
          ]
        })
        |> Repo.insert(prefix: "public")

      invoice = Repo.preload(invoice, :items)
      html = Invoice.to_html(invoice)

      assert is_binary(html)
      assert html =~ "99999" or html =~ "€"
    end
  end
end
