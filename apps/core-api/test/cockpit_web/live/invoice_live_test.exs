defmodule CockpitWeb.Live.InvoiceLiveTest do
  @moduledoc false

  use Lotta.DataCase, async: true

  alias CockpitWeb.Live.InvoiceLive

  describe "can?/3" do
    test "allows index action" do
      assert InvoiceLive.can?(nil, :index, nil) == true
    end

    test "allows show action" do
      assert InvoiceLive.can?(nil, :show, nil) == true
    end

    test "denies edit action" do
      refute InvoiceLive.can?(nil, :edit, nil)
    end

    test "denies delete action" do
      refute InvoiceLive.can?(nil, :delete, nil)
    end

    test "denies create action" do
      refute InvoiceLive.can?(nil, :create, nil)
    end

    test "denies new action" do
      refute InvoiceLive.can?(nil, :new, nil)
    end

    test "denies custom actions" do
      refute InvoiceLive.can?(nil, :custom_action, nil)
      refute InvoiceLive.can?(nil, :another_action, nil)
    end

    test "allows actions regardless of first argument" do
      assert InvoiceLive.can?(:any_value, :index, nil)
      assert InvoiceLive.can?(%{}, :show, nil)
      assert InvoiceLive.can?(123, :index, nil)
    end

    test "allows actions regardless of third argument" do
      assert InvoiceLive.can?(nil, :index, :any_value)
      assert InvoiceLive.can?(nil, :show, %{})
      assert InvoiceLive.can?(nil, :index, 123)
    end
  end

  describe "singular_name/0" do
    test "returns correct singular name" do
      assert InvoiceLive.singular_name() == "Invoice"
    end
  end

  describe "plural_name/0" do
    test "returns correct plural name" do
      assert InvoiceLive.plural_name() == "Invoices"
    end
  end

  describe "fields/0" do
    test "returns field configuration with all expected fields" do
      fields = InvoiceLive.fields()

      assert is_list(fields)

      # Check that all expected fields are present
      assert Keyword.has_key?(fields, :invoice_number)
      assert Keyword.has_key?(fields, :period)
      assert Keyword.has_key?(fields, :customer_no)
      assert Keyword.has_key?(fields, :total)
      assert Keyword.has_key?(fields, :issued_at)
      assert Keyword.has_key?(fields, :due_date)
      assert Keyword.has_key?(fields, :paid_at)
    end

    test "invoice_number field is configured correctly" do
      fields = InvoiceLive.fields()
      config = Keyword.get(fields, :invoice_number)

      assert config.module == Backpex.Fields.Text
      assert config.label == "Invoice Number"
      assert config.readonly == true
    end

    test "period field uses Text module with custom select" do
      fields = InvoiceLive.fields()
      config = Keyword.get(fields, :period)

      assert config.module == Backpex.Fields.Text
      assert config.label == "Period"
      # Verify select is present (it's an Ecto.Query.DynamicExpr)
      assert Map.has_key?(config, :select)
      assert config.select != nil
    end

    test "customer_no field is configured correctly" do
      fields = InvoiceLive.fields()
      config = Keyword.get(fields, :customer_no)

      assert config.module == Backpex.Fields.Text
      assert config.label == "Customer Number"
    end

    test "total field uses Currency module with EUR formatting" do
      fields = InvoiceLive.fields()
      config = Keyword.get(fields, :total)

      assert config.module == Backpex.Fields.Currency
      assert config.label == "Amount"
      assert config.unit == "EUR"
      assert config.radix == ","
      assert config.thousands_separator == " "
    end

    test "issued_at field is readonly DateTime" do
      fields = InvoiceLive.fields()
      config = Keyword.get(fields, :issued_at)

      assert config.module == Backpex.Fields.DateTime
      assert config.label == "Issued At"
      assert config.readonly == true
    end

    test "due_date field is readonly Date" do
      fields = InvoiceLive.fields()
      config = Keyword.get(fields, :due_date)

      assert config.module == Backpex.Fields.Date
      assert config.label == "Due Date"
      assert config.readonly == true
    end

    test "paid_at field is readonly DateTime" do
      fields = InvoiceLive.fields()
      config = Keyword.get(fields, :paid_at)

      assert config.module == Backpex.Fields.DateTime
      assert config.label == "Paid At"
      assert config.readonly == true
    end

    test "all readonly fields are marked correctly" do
      fields = InvoiceLive.fields()

      readonly_fields = [:invoice_number, :issued_at, :due_date, :paid_at]
      editable_fields = [:period, :customer_no, :total]

      for field <- readonly_fields do
        config = Keyword.get(fields, field)
        assert config.readonly == true, "Expected #{field} to be readonly"
      end

      for field <- editable_fields do
        config = Keyword.get(fields, field)
        refute Map.get(config, :readonly), "Expected #{field} to not be readonly"
      end
    end

    test "field labels are human-readable" do
      fields = InvoiceLive.fields()

      expected_labels = [
        invoice_number: "Invoice Number",
        period: "Period",
        customer_no: "Customer Number",
        total: "Amount",
        issued_at: "Issued At",
        due_date: "Due Date",
        paid_at: "Paid At"
      ]

      for {field, expected_label} <- expected_labels do
        config = Keyword.get(fields, field)

        assert config.label == expected_label,
               "Expected #{field} label to be '#{expected_label}', got '#{config.label}'"
      end
    end

    test "fields are in expected order" do
      fields = InvoiceLive.fields()
      field_keys = Keyword.keys(fields)

      expected_order = [
        :tenant,
        :invoice_number,
        :period,
        :customer_no,
        :total,
        :issued_at,
        :due_date,
        :paid_at
      ]

      assert field_keys == expected_order
    end
  end

  describe "render_resource_slot/3" do
    import Phoenix.LiveViewTest

    test "renders iframe for :show action and :main slot" do
      invoice = %Lotta.Billings.Invoice{
        id: 1,
        invoice_number: "INV-2024-001",
        year: 2024,
        month: 1,
        period_start: ~D[2024-01-01],
        period_end: ~D[2024-01-31],
        total: Decimal.new("100.00"),
        customer_name: "Test Customer",
        customer_no: "C-001",
        items: []
      }

      assigns = %{item: invoice}

      html =
        rendered_to_string(InvoiceLive.render_resource_slot(assigns, :show, :main))

      # Verify iframe is present
      assert html =~ ~s|<iframe|

      # Verify iframe has correct styling
      assert html =~
               ~s|style="width: min(80%, 794px); aspect-ratio: 210 / 297; border: none; zoom: .75; padding: 1em;"|

      # Verify iframe has onLoad handler
      assert html =~
               ~s|onLoad="this.style.height=this.contentWindow.document.body.scrollHeight +'px';"|

      # Verify src attribute starts with data URI
      assert html =~ ~s|src="data:text/html;base64,|
    end

    test "iframe src contains base64 encoded HTML" do
      invoice = %Lotta.Billings.Invoice{
        id: 2,
        invoice_number: "INV-2024-002",
        year: 2024,
        month: 2,
        period_start: ~D[2024-02-01],
        period_end: ~D[2024-02-29],
        total: Decimal.new("250.50"),
        customer_name: "Another Customer",
        customer_no: "C-002",
        items: []
      }

      assigns = %{item: invoice}

      html =
        rendered_to_string(InvoiceLive.render_resource_slot(assigns, :show, :main))

      [_, src] = Regex.run(~r/src="([^"]+)"/, html)

      assert String.starts_with?(src, "data:text/html;base64,")

      base64_content = String.replace_prefix(src, "data:text/html;base64,", "")
      decoded_html = Base.decode64!(base64_content)

      assert is_binary(decoded_html)
      assert String.length(decoded_html) > 0
    end

    test "render_resource_slot is defined for specific action and slot" do
      assert function_exported?(InvoiceLive, :render_resource_slot, 3)
    end
  end

  # Note: Backpex configuration (adapter_config, layout) is set at compile time
  # and tested through integration tests with the LiveView system
end
