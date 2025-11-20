defmodule Lotta.Billings.InvoiceTest do
  @moduledoc false

  use Lotta.DataCase

  alias Lotta.Billings.Invoice
  alias Lotta.Tenants

  setup do
    tenant = Tenants.get_tenant_by_slug("test")
    {:ok, tenant: tenant}
  end

  describe "create_changeset/1" do
    test "valid changeset with all required fields", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test plan",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      assert changeset.valid?
    end

    test "requires invoice_number", %{tenant: tenant} do
      attrs = %{
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      refute changeset.valid?
      assert %{invoice_number: ["can't be blank"]} = errors_on(changeset)
    end

    test "requires tenant_id", %{tenant: _tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      refute changeset.valid?
      assert %{tenant_id: ["can't be blank"]} = errors_on(changeset)
    end

    test "requires year", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      refute changeset.valid?
      assert %{year: ["can't be blank"]} = errors_on(changeset)
    end

    test "requires month", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      refute changeset.valid?
      assert %{month: ["can't be blank"]} = errors_on(changeset)
    end

    test "requires period_start", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_end: ~D[2025-11-30],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      refute changeset.valid?
      assert %{period_start: ["can't be blank"]} = errors_on(changeset)
    end

    test "requires period_end", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      refute changeset.valid?
      assert %{period_end: ["can't be blank"]} = errors_on(changeset)
    end

    test "requires total", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      refute changeset.valid?
      assert %{total: ["can't be blank"]} = errors_on(changeset)
    end

    test "validates year is >= 2025", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2024,
        month: 11,
        period_start: ~D[2024-11-01],
        period_end: ~D[2024-11-30],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      refute changeset.valid?
      assert %{year: ["must be greater than or equal to 2025"]} = errors_on(changeset)
    end

    test "validates month is between 1 and 12", %{tenant: tenant} do
      # Test month too low (without period dates to avoid Date.new! crash)
      attrs_too_low = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 0,
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset_low = Invoice.create_changeset(attrs_too_low)
      refute changeset_low.valid?
      assert %{month: ["must be greater than or equal to 1"]} = errors_on(changeset_low)

      # Test month too high (without period dates to avoid Date.new! crash)
      attrs_too_high = %{
        invoice_number: "LTA00002",
        tenant_id: tenant.id,
        year: 2025,
        month: 13,
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset_high = Invoice.create_changeset(attrs_too_high)
      refute changeset_high.valid?
      assert %{month: ["must be less than or equal to 12"]} = errors_on(changeset_high)
    end

    test "validates total is >= 0", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        total: "-10.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "-10.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      refute changeset.valid?
      assert %{total: ["must be greater than or equal to 0"]} = errors_on(changeset)
    end

    test "validates at least one item is present", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        total: "100.00",
        items: []
      }

      changeset = Invoice.create_changeset(attrs)

      refute changeset.valid?
      assert %{items: ["must have at least one item"]} = errors_on(changeset)
    end

    test "validates period_start is first day of month", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-15],
        period_end: ~D[2025-11-30],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      refute changeset.valid?
      assert %{period_start: ["must be the first day of the month"]} = errors_on(changeset)
    end

    test "validates period_end is last day of month", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-15],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      refute changeset.valid?
      assert %{period_end: ["must be the last day of the month"]} = errors_on(changeset)
    end

    test "validates period dates for february in leap year", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2028,
        month: 2,
        period_start: ~D[2028-02-01],
        period_end: ~D[2028-02-29],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      assert changeset.valid?
    end

    test "validates period dates for february in non-leap year", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2027,
        month: 2,
        period_start: ~D[2027-02-01],
        period_end: ~D[2027-02-28],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      assert changeset.valid?
    end

    test "accepts valid customer information", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ],
        customer_name: "Test Customer",
        customer_address: "123 Main St",
        customer_no: "CUST001",
        customer_contact_name: "John Doe",
        customer_contact_email: "john@example.com",
        customer_contact_phone: "+1-555-0123"
      }

      changeset = Invoice.create_changeset(attrs)

      assert changeset.valid?
      assert get_field(changeset, :customer_name) == "Test Customer"
      assert get_field(changeset, :customer_address) == "123 Main St"
    end

    test "accepts nil customer information", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ],
        customer_name: nil,
        customer_address: nil
      }

      changeset = Invoice.create_changeset(attrs)

      assert changeset.valid?
    end

    test "defaults status to :draft", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        total: "100.00",
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      assert get_field(changeset, :status) == :draft
    end

    test "allows setting status explicitly", %{tenant: tenant} do
      attrs = %{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        total: "100.00",
        status: :issued,
        items: [
          %{
            type: "plan",
            period_start: ~D[2025-11-01],
            period_end: ~D[2025-11-30],
            amount: "100.00",
            notes: "Test",
            rows: []
          }
        ]
      }

      changeset = Invoice.create_changeset(attrs)

      assert get_field(changeset, :status) == :issued
    end
  end

  describe "update_changeset/2" do
    setup %{tenant: tenant} do
      invoice = %Invoice{
        invoice_number: "LTA00001",
        tenant_id: tenant.id,
        year: 2025,
        month: 11,
        period_start: ~D[2025-11-01],
        period_end: ~D[2025-11-30],
        total: Decimal.new("100.00"),
        status: :draft
      }

      {:ok, invoice: invoice}
    end

    test "allows updating status with required dates", %{invoice: invoice} do
      changeset =
        Invoice.update_changeset(invoice, %{
          status: :issued,
          issued_at: DateTime.utc_now(),
          due_date: Date.utc_today()
        })

      assert changeset.valid?
      assert get_field(changeset, :status) == :issued
    end

    test "allows updating notes", %{invoice: invoice} do
      changeset = Invoice.update_changeset(invoice, %{notes: "Payment pending"})

      assert changeset.valid?
      assert get_field(changeset, :notes) == "Payment pending"
    end

    test "requires issued_at for issued status", %{invoice: invoice} do
      changeset = Invoice.update_changeset(invoice, %{status: :issued})

      refute changeset.valid?
      assert %{issued_at: ["can't be blank"]} = errors_on(changeset)
    end

    test "requires due_date for issued status", %{invoice: invoice} do
      changeset =
        Invoice.update_changeset(invoice, %{
          status: :issued,
          issued_at: DateTime.utc_now()
        })

      refute changeset.valid?
      assert %{due_date: ["can't be blank"]} = errors_on(changeset)
    end

    test "requires issued_at and due_date for overdue status", %{invoice: invoice} do
      changeset = Invoice.update_changeset(invoice, %{status: :overdue})

      refute changeset.valid?
      errors = errors_on(changeset)
      assert %{issued_at: ["can't be blank"], due_date: ["can't be blank"]} = errors
    end

    test "requires issued_at, due_date, and paid_at for paid status", %{invoice: invoice} do
      changeset = Invoice.update_changeset(invoice, %{status: :paid})

      refute changeset.valid?
      errors = errors_on(changeset)

      assert %{
               issued_at: ["can't be blank"],
               due_date: ["can't be blank"],
               paid_at: ["can't be blank"]
             } = errors
    end

    test "allows draft status without dates", %{invoice: invoice} do
      changeset = Invoice.update_changeset(invoice, %{status: :draft})

      assert changeset.valid?
    end

    test "accepts all required dates for paid status", %{invoice: invoice} do
      now = DateTime.utc_now()
      due = Date.utc_today()

      changeset =
        Invoice.update_changeset(invoice, %{
          status: :paid,
          issued_at: now,
          due_date: due,
          paid_at: now
        })

      assert changeset.valid?
    end

    test "allows updating to cancelled status", %{invoice: invoice} do
      changeset = Invoice.update_changeset(invoice, %{status: :cancelled})

      assert changeset.valid?
    end
  end

  describe "to_html/1" do
    setup %{tenant: tenant} do
      # Create a complete invoice with items
      {:ok, invoice} =
        Invoice.create_changeset(%{
          invoice_number: "LTA00001",
          tenant_id: tenant.id,
          year: 2025,
          month: 11,
          period_start: ~D[2025-11-01],
          period_end: ~D[2025-11-30],
          total: "100.00",
          status: :issued,
          customer_name: "Test Customer",
          customer_address: "123 Main St",
          items: [
            %{
              type: "plan",
              period_start: ~D[2025-11-01],
              period_end: ~D[2025-11-30],
              amount: "100.00",
              notes: "Test Plan",
              rows: [
                %{
                  "description" => "Base Plan",
                  "quantity" => 1,
                  "unit_price" => "100.00",
                  "amount" => "100.00",
                  "type" => "base_price"
                }
              ]
            }
          ]
        })
        |> Repo.insert(prefix: "public")

      invoice = Repo.preload(invoice, :items)
      {:ok, invoice: invoice}
    end

    test "renders HTML string", %{invoice: invoice} do
      html = Invoice.to_html(invoice)

      assert is_binary(html)
      assert String.contains?(html, "<!DOCTYPE html>") or String.contains?(html, "<html")
    end

    test "includes invoice number in HTML", %{invoice: invoice} do
      html = Invoice.to_html(invoice)

      assert html =~ invoice.invoice_number
    end

    test "includes customer name in HTML", %{invoice: invoice} do
      html = Invoice.to_html(invoice)

      assert html =~ "Test Customer"
    end

    test "includes total amount in HTML", %{invoice: invoice} do
      html = Invoice.to_html(invoice)

      # Should contain the total in some format
      assert html =~ "100" or html =~ Decimal.to_string(invoice.total)
    end

    test "includes item descriptions in HTML", %{invoice: invoice} do
      html = Invoice.to_html(invoice)

      assert html =~ "Base Plan"
    end

    test "renders without customer information", %{tenant: tenant} do
      {:ok, invoice} =
        Invoice.create_changeset(%{
          invoice_number: "LTA00002",
          tenant_id: tenant.id,
          year: 2025,
          month: 10,
          period_start: ~D[2025-10-01],
          period_end: ~D[2025-10-31],
          total: "50.00",
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

  describe "to_pdf/1" do
    import Mock

    setup %{tenant: tenant} do
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
          customer_name: "PDF Test Customer",
          customer_address: "123 PDF St",
          items: [
            %{
              type: "plan",
              period_start: ~D[2025-11-01],
              period_end: ~D[2025-11-30],
              amount: "100.00",
              notes: "Test Plan",
              rows: [
                %{
                  "description" => "Base Plan",
                  "quantity" => 1,
                  "unit_price" => "100.00",
                  "amount" => "100.00",
                  "type" => "base_price"
                }
              ]
            }
          ]
        })
        |> Repo.insert(prefix: "public")

      invoice = Repo.preload(invoice, :items)
      {:ok, invoice: invoice}
    end

    test "generates PDF binary", %{invoice: invoice} do
      mock_pdf_binary = <<"%PDF-1.4\n">>

      with_mock ChromicPDF,
        print_to_pdf: fn {:html, _html}, _opts -> {:ok, mock_pdf_binary} end do
        pdf = Invoice.to_pdf(invoice)

        assert is_binary(pdf)
        assert pdf == mock_pdf_binary
        # Verify ChromicPDF was called
        assert called(ChromicPDF.print_to_pdf(:_, :_))
      end
    end

    test "calls ChromicPDF with correct HTML content", %{invoice: invoice} do
      mock_pdf_binary = <<"%PDF-1.4\n">>

      with_mock ChromicPDF,
        print_to_pdf: fn {:html, html}, _opts ->
          # Verify HTML contains invoice data
          assert is_binary(html)
          assert String.contains?(html, invoice.invoice_number)
          {:ok, mock_pdf_binary}
        end do
        pdf = Invoice.to_pdf(invoice)

        assert pdf == mock_pdf_binary
      end
    end

    test "calls ChromicPDF with header and footer configuration", %{invoice: invoice} do
      mock_pdf_binary = <<"%PDF-1.4\n">>

      with_mock ChromicPDF,
        print_to_pdf: fn {:html, _html}, opts ->
          # Verify print options are passed
          assert opts[:print_to_pdf][:displayHeaderFooter] == true
          assert is_binary(opts[:print_to_pdf][:footerTemplate])
          assert opts[:print_to_pdf][:headerTemplate] == "<span></span>"
          {:ok, mock_pdf_binary}
        end do
        Invoice.to_pdf(invoice)

        assert called(ChromicPDF.print_to_pdf(:_, :_))
      end
    end

    test "handles invoice with all customer information", %{tenant: tenant} do
      {:ok, invoice_with_customer} =
        Invoice.create_changeset(%{
          invoice_number: "LTA01000",
          tenant_id: tenant.id,
          year: 2025,
          month: 10,
          period_start: ~D[2025-10-01],
          period_end: ~D[2025-10-31],
          total: "200.00",
          customer_name: "Full Customer Info",
          customer_address: "456 Complete Ave",
          customer_no: "CUST-001",
          customer_contact_name: "John Doe",
          customer_contact_email: "john@example.com",
          items: [
            %{
              type: "plan",
              period_start: ~D[2025-10-01],
              period_end: ~D[2025-10-31],
              amount: "200.00",
              notes: "Test",
              rows: []
            }
          ]
        })
        |> Repo.insert(prefix: "public")

      invoice_with_customer = Repo.preload(invoice_with_customer, :items)
      mock_pdf_binary = <<"%PDF-1.4\n">>

      with_mock ChromicPDF,
        print_to_pdf: fn {:html, html}, _opts ->
          # Verify customer info is in HTML
          assert is_binary(html)
          assert String.contains?(html, "Full Customer Info")

          assert String.contains?(html, "john@example.com") or
                   String.contains?(html, "CUST-001")

          {:ok, mock_pdf_binary}
        end do
        pdf = Invoice.to_pdf(invoice_with_customer)

        assert is_binary(pdf)
      end
    end

    test "works with invoice containing no customer information", %{tenant: tenant} do
      {:ok, invoice_no_customer} =
        Invoice.create_changeset(%{
          invoice_number: "LTA01001",
          tenant_id: tenant.id,
          year: 2025,
          month: 9,
          period_start: ~D[2025-09-01],
          period_end: ~D[2025-09-30],
          total: "50.00",
          customer_name: nil,
          customer_address: nil,
          items: [
            %{
              type: "plan",
              period_start: ~D[2025-09-01],
              period_end: ~D[2025-09-30],
              amount: "50.00",
              notes: "Test",
              rows: []
            }
          ]
        })
        |> Repo.insert(prefix: "public")

      invoice_no_customer = Repo.preload(invoice_no_customer, :items)
      mock_pdf_binary = <<"%PDF-1.4\n">>

      with_mock ChromicPDF,
        print_to_pdf: fn {:html, _html}, _opts -> {:ok, mock_pdf_binary} end do
        pdf = Invoice.to_pdf(invoice_no_customer)

        assert is_binary(pdf)
        assert pdf == mock_pdf_binary
      end
    end
  end
end
