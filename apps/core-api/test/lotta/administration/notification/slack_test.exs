defmodule Lotta.Administration.Notification.SlackTest do
  use Lotta.DataCase

  import Mock

  alias Lotta.Administration.Notification.Slack
  alias Lotta.Tenants

  @prefix "tenant_test"

  @test_admin_users [
    %{
      id: 1,
      name: "John Doe",
      email: "john.doe@test-school.de"
    },
    %{
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@test-school.de"
    }
  ]

  @test_config [
    webhook: "https://hooks.slack.com/services/TEST/WEBHOOK/URL"
  ]

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    # Mock the application configuration
    original_config = Application.get_env(:lotta, Lotta.Administration.Notification.Slack, [])
    original_env = Application.get_env(:lotta, :environment, "development")

    Application.put_env(:lotta, Lotta.Administration.Notification.Slack, @test_config)
    Application.put_env(:lotta, :environment, "test")

    on_exit(fn ->
      Application.put_env(:lotta, Lotta.Administration.Notification.Slack, original_config)
      Application.put_env(:lotta, :environment, original_env)
    end)

    {:ok, tenant: tenant}
  end

  describe "new_lotta_notification/1" do
    test "creates notification with correct structure", %{tenant: tenant} do
      with_mock(LottaWeb.Urls,
        get_tenant_url: fn ^tenant -> "https://#{tenant.slug}.local.lotta.schule" end
      ) do
        notification = Slack.new_lotta_notification(tenant, [])

        assert %{blocks: blocks} = notification
        assert is_list(blocks)
        assert length(blocks) >= 4
      end
    end

    test "includes header block with correct text", %{tenant: tenant} do
      with_mock(LottaWeb.Urls,
        get_tenant_url: fn ^tenant -> "https://#{tenant.slug}.local.lotta.schule" end
      ) do
        notification = Slack.new_lotta_notification(tenant, [])

        header_block = Enum.find(notification.blocks, &(&1.type == :header))
        assert header_block
        assert header_block.text.type == :plain_text
        assert header_block.text.emoji == true
        assert header_block.text.text == ":partying_face: Neues Lotta-System wurde angelegt"
      end
    end

    test "includes context block with current date and environment", %{tenant: tenant} do
      with_mock(LottaWeb.Urls,
        get_tenant_url: fn ^tenant -> "https://#{tenant.slug}.local.lotta.schule" end
      ) do
        notification = Slack.new_lotta_notification(tenant, [])

        context_block = Enum.find(notification.blocks, &(&1.type == :context))
        assert context_block
        assert context_block.elements

        element = hd(context_block.elements)
        assert element.type == :mrkdwn
        assert element.text =~ "test"
        assert element.text =~ ~r/\*\d{2}\.\d{2}\.\d{2}\*/
      end
    end

    test "includes tenant name section with button", %{tenant: tenant} do
      tenant_url = "https://#{tenant.slug}.local.lotta.schule"

      with_mock(LottaWeb.Urls,
        get_tenant_url: fn ^tenant -> tenant_url end
      ) do
        notification = Slack.new_lotta_notification(tenant, [])

        name_section =
          Enum.find(notification.blocks, fn block ->
            block.type == :section &&
              block.text &&
              String.contains?(block.text.text, "**Name:**")
          end)

        assert name_section
        assert name_section.text.type == :mrkdwn
        assert name_section.text.text == "**Name:**\n#{tenant.title}"

        assert name_section.accessory
        assert name_section.accessory.type == :button
        assert name_section.accessory.text.type == :plain_text
        assert name_section.accessory.text.text == "Lotta öffnen"
        assert name_section.accessory.url == tenant_url
      end
    end

    test "includes tenant slug section", %{tenant: tenant} do
      with_mock(LottaWeb.Urls,
        get_tenant_url: fn ^tenant -> "https://#{tenant.slug}.local.lotta.schule" end
      ) do
        notification = Slack.new_lotta_notification(tenant, [])

        slug_section =
          Enum.find(notification.blocks, fn block ->
            block.type == :section &&
              block.text &&
              String.contains?(block.text.text, "**Kürzel:**")
          end)

        assert slug_section
        assert slug_section.text.type == :mrkdwn
        assert slug_section.text.text == "**Kürzel:**\n#{tenant.slug}"
      end
    end

    test "includes admin user sections", %{tenant: tenant} do
      with_mock(LottaWeb.Urls,
        get_tenant_url: fn ^tenant -> "https://#{tenant.slug}.local.lotta.schule" end
      ) do
        notification = Slack.new_lotta_notification(tenant, @test_admin_users)

        user_sections =
          Enum.filter(notification.blocks, fn block ->
            block.type == :section &&
              block.text &&
              String.contains?(block.text.text, ":teacher:")
          end)

        assert length(user_sections) == 2

        first_user_section = Enum.at(user_sections, 0)
        assert first_user_section.text.type == :mrkdwn
        assert String.contains?(first_user_section.text.text, "John Doe")
        assert String.contains?(first_user_section.text.text, "john.doe@test-school.de")

        second_user_section = Enum.at(user_sections, 1)
        assert String.contains?(second_user_section.text.text, "Jane Smith")
        assert String.contains?(second_user_section.text.text, "jane.smith@test-school.de")
      end
    end

    test "handles empty admin users list", %{tenant: tenant} do
      with_mock(LottaWeb.Urls,
        get_tenant_url: fn ^tenant -> "https://#{tenant.slug}.local.lotta.schule" end
      ) do
        notification = Slack.new_lotta_notification(tenant, [])

        user_sections =
          Enum.filter(notification.blocks, fn block ->
            block.type == :section &&
              block.text &&
              String.contains?(block.text.text, ":teacher:")
          end)

        assert Enum.empty?(user_sections)
        assert length(notification.blocks) == 4
      end
    end
  end

  describe "new_lotta_invoices_to_issue_notification/1" do
    test "creates notification with correct structure" do
      invoices = [
        {
          %Tenants.Tenant{slug: "test-school", title: "Test School"},
          %{invoice_number: "2024-001", total: Decimal.new("150.00")}
        },
        {
          %Tenants.Tenant{slug: "another-school", title: "Another School"},
          %{invoice_number: "2024-002", total: Decimal.new("200.50")}
        }
      ]

      notification = Slack.new_lotta_invoices_to_issue_notification(invoices)

      assert %{blocks: blocks} = notification
      assert is_list(blocks)
      assert length(blocks) == 5
    end

    test "includes header section with correct text" do
      invoices = [
        {
          %Tenants.Tenant{slug: "test-school", title: "Test School"},
          %{invoice_number: "2024-001", total: Decimal.new("150.00")}
        }
      ]

      notification = Slack.new_lotta_invoices_to_issue_notification(invoices)

      header_section = Enum.at(notification.blocks, 0)
      assert header_section.type == "section"
      assert header_section.text.type == "mrkdwn"

      assert header_section.text.text ==
               "*Neue Lotta-Rechnungen stehen zur Ausstellung im Cockpit bereit*"
    end

    test "includes dividers" do
      invoices = [
        {
          %Tenants.Tenant{slug: "test-school", title: "Test School"},
          %{invoice_number: "2024-001", total: Decimal.new("150.00")}
        }
      ]

      notification = Slack.new_lotta_invoices_to_issue_notification(invoices)

      dividers = Enum.filter(notification.blocks, &(&1.type == "divider"))
      assert length(dividers) == 2
    end

    test "includes invoice list with tenant and invoice details" do
      invoices = [
        {
          %Tenants.Tenant{slug: "test-school", title: "Test School"},
          %{invoice_number: "2024-001", total: Decimal.new("150.00")}
        },
        {
          %Tenants.Tenant{slug: "another-school", title: "Another School"},
          %{invoice_number: "2024-002", total: Decimal.new("200.50")}
        }
      ]

      notification = Slack.new_lotta_invoices_to_issue_notification(invoices)

      invoice_section = Enum.at(notification.blocks, 2)
      assert invoice_section.type == "section"
      assert invoice_section.text.type == "mrkdwn"

      invoice_text = invoice_section.text.text
      assert invoice_text =~ "test-school"
      assert invoice_text =~ "2024-001"
      assert invoice_text =~ "150.00"
      assert invoice_text =~ "another-school"
      assert invoice_text =~ "2024-002"
      assert invoice_text =~ "200.50"
    end

    test "includes footer instruction text" do
      invoices = [
        {
          %Tenants.Tenant{slug: "test-school", title: "Test School"},
          %{invoice_number: "2024-001", total: Decimal.new("150.00")}
        }
      ]

      notification = Slack.new_lotta_invoices_to_issue_notification(invoices)

      footer_section = Enum.at(notification.blocks, 4)
      assert footer_section.type == "section"
      assert footer_section.text.type == "mrkdwn"

      assert footer_section.text.text ==
               "Um die Rechnungen auszustellen, müssen sie im Cockpit bestätigt werden"
    end

    test "handles single invoice" do
      invoices = [
        {
          %Tenants.Tenant{slug: "single-school", title: "Single School"},
          %{invoice_number: "2024-999", total: Decimal.new("99.99")}
        }
      ]

      notification = Slack.new_lotta_invoices_to_issue_notification(invoices)

      invoice_section = Enum.at(notification.blocks, 2)
      invoice_text = invoice_section.text.text

      assert invoice_text =~ "single-school"
      assert invoice_text =~ "2024-999"
      assert invoice_text =~ "99.99"
      # Should only have one line
      refute invoice_text =~ "\n-"
    end

    test "handles multiple invoices with correct formatting" do
      invoices = [
        {
          %Tenants.Tenant{slug: "school-1", title: "School 1"},
          %{invoice_number: "2024-001", total: Decimal.new("100.00")}
        },
        {
          %Tenants.Tenant{slug: "school-2", title: "School 2"},
          %{invoice_number: "2024-002", total: Decimal.new("200.00")}
        },
        {
          %Tenants.Tenant{slug: "school-3", title: "School 3"},
          %{invoice_number: "2024-003", total: Decimal.new("300.00")}
        }
      ]

      notification = Slack.new_lotta_invoices_to_issue_notification(invoices)

      invoice_section = Enum.at(notification.blocks, 2)
      invoice_text = invoice_section.text.text

      # Verify each invoice appears on its own line
      lines = String.split(invoice_text, "\n")
      assert length(lines) == 3

      # Verify each line has the correct format
      assert Enum.at(lines, 0) =~ "- *school-1*: Rechnung #2024-001 über 100.00 EUR"
      assert Enum.at(lines, 1) =~ "- *school-2*: Rechnung #2024-002 über 200.00 EUR"
      assert Enum.at(lines, 2) =~ "- *school-3*: Rechnung #2024-003 über 300.00 EUR"
    end

    test "handles empty invoice list" do
      invoices = []

      notification = Slack.new_lotta_invoices_to_issue_notification(invoices)

      invoice_section = Enum.at(notification.blocks, 2)
      assert invoice_section.text.text == ""
    end
  end

  describe "send/1" do
    test "sends notification successfully when webhook URL is configured" do
      notification = %{blocks: []}

      with_mock(Tesla, [:passthrough],
        post: fn _client, url, ^notification ->
          assert url == "https://hooks.slack.com/services/TEST/WEBHOOK/URL"
          {:ok, %Tesla.Env{status: 200, body: "ok"}}
        end
      ) do
        result = Slack.send(notification)

        assert {:ok, %Tesla.Env{status: 200}} = result
        assert called(Tesla.post(:_, :_, :_))
      end
    end

    test "returns error when webhook URL is not configured" do
      Application.put_env(:lotta, Lotta.Administration.Notification.Slack, webhook: nil)

      notification = %{blocks: []}

      with_mock(Tesla, [:passthrough], []) do
        result = Slack.send(notification)

        assert {:error, "Slack webhook URL is not configured"} = result
        assert not called(Tesla.post(:_, :_, :_))
      end
    end

    test "handles Tesla HTTP errors" do
      notification = %{blocks: []}

      with_mock(Tesla, [:passthrough],
        post: fn _client, _url, ^notification ->
          {:error, :timeout}
        end
      ) do
        result = Slack.send(notification)

        assert {:error, :timeout} = result
      end
    end

    test "handles Tesla HTTP error responses" do
      notification = %{blocks: []}

      with_mock(Tesla, [:passthrough],
        post: fn _client, _url, ^notification ->
          {:ok, %Tesla.Env{status: 400, body: "Invalid request"}}
        end
      ) do
        result = Slack.send(notification)

        assert {:ok, %Tesla.Env{status: 400}} = result
      end
    end
  end

  describe "configuration handling" do
    test "handles missing webhook configuration gracefully" do
      Application.delete_env(:lotta, Lotta.Administration.Notification.Slack)

      notification = %{blocks: []}
      result = Slack.send(notification)

      assert {:error, "Slack webhook URL is not configured"} = result
    end

    test "handles nil webhook configuration" do
      Application.put_env(:lotta, Lotta.Administration.Notification.Slack, webhook: nil)

      notification = %{blocks: []}
      result = Slack.send(notification)

      assert {:error, "Slack webhook URL is not configured"} = result
    end

    test "handles empty webhook configuration" do
      Application.put_env(:lotta, Lotta.Administration.Notification.Slack, [])

      notification = %{blocks: []}
      result = Slack.send(notification)

      assert {:error, "Slack webhook URL is not configured"} = result
    end
  end

  describe "integration scenarios" do
    test "complete flow: create notification and send it", %{tenant: tenant} do
      with_mock(LottaWeb.Urls,
        get_tenant_url: fn ^tenant -> "https://#{tenant.slug}.local.lotta.schule" end
      ) do
        with_mock(Tesla, [:passthrough],
          post: fn _client, _url, notification ->
            assert %{blocks: blocks} = notification
            assert length(blocks) >= 4
            {:ok, %Tesla.Env{status: 200, body: "ok"}}
          end
        ) do
          notification = Slack.new_lotta_notification(tenant, @test_admin_users)
          result = Slack.send(notification)

          assert {:ok, %Tesla.Env{status: 200}} = result
        end
      end
    end

    test "handles different environment names", %{tenant: tenant} do
      Application.put_env(:lotta, :environment, "production")

      with_mock(LottaWeb.Urls,
        get_tenant_url: fn ^tenant -> "https://#{tenant.slug}.local.lotta.schule" end
      ) do
        notification = Slack.new_lotta_notification(tenant, [])

        context_block = Enum.find(notification.blocks, &(&1.type == :context))
        element_text = hd(context_block.elements).text

        assert element_text =~ "production"
      end
    end

    test "handles default environment when not configured", %{tenant: tenant} do
      Application.delete_env(:lotta, :environment)

      with_mock(LottaWeb.Urls,
        get_tenant_url: fn ^tenant -> "https://#{tenant.slug}.local.lotta.schule" end
      ) do
        notification = Slack.new_lotta_notification(tenant, [])

        context_block = Enum.find(notification.blocks, &(&1.type == :context))
        element_text = hd(context_block.elements).text

        assert element_text =~ "development"
      end
    end
  end
end
