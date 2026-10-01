defmodule Lotta.Worker.TenantTest do
  use Lotta.WorkerCase, async: false

  import Mox
  import Lotta.Factory

  alias Lotta.Worker.Tenant
  alias Lotta.{Tenants}
  alias Lotta.Tenants.DefaultContentMock
  alias Lotta.AnalyticsMock
  alias Lotta.Administration.Notification.SlackMock
  alias Lotta.TenantsUsageMock
  alias Lotta.BillingsMock

  setup :set_mox_global
  setup :verify_on_exit!

  setup do
    Lotta.Repo.put_prefix("tenant_test")

    stub(SlackMock, :send, fn _msg -> :ok end)
    stub(SlackMock, :new_lotta_notification, fn _tenant, _users -> %{} end)
    stub(SlackMock, :new_lotta_invoices_to_issue_notification, fn _invoices -> %{} end)
    stub(DefaultContentMock, :create_default_content, fn _t, _u -> :ok end)
    stub(AnalyticsMock, :create_site, fn _t -> :ok end)
    stub(TenantsUsageMock, :create_usage_logs, fn _t -> :ok end)
    stub(TenantsUsageMock, :refresh_monthly_usage_logs, fn _opts -> :ok end)
    stub(BillingsMock, :generate_invoice, fn _t, _y, _m -> {:ok, %{invoice_number: "TST001"}} end)

    :ok
  end

  describe "setup" do
    test "calls DefaultContent.create_default_content with correct arguments" do
      tenant = Tenants.get_tenant_by_slug("test")
      user = insert(:user)

      expect(DefaultContentMock, :create_default_content, fn _t, _u -> :ok end)
      stub(AnalyticsMock, :create_site, fn _t -> :ok end)

      perform_job(Tenant, %{
        "type" => "setup",
        "id" => tenant.id,
        "user_email" => user.email,
        "user_password" => "test_password",
        "eduplaces_id" => nil
      })
    end

    test "handles eduplaces_id when provided" do
      tenant = Tenants.get_tenant_by_slug("test")
      user = insert(:user, eduplaces_id: "test_eduplaces_id")

      expect(DefaultContentMock, :create_default_content, fn _t, _u -> :ok end)
      stub(AnalyticsMock, :create_site, fn _t -> :ok end)

      result =
        perform_job(Tenant, %{
          "type" => "setup",
          "id" => tenant.id,
          "user_email" => nil,
          "user_password" => "test_password",
          "eduplaces_id" => user.eduplaces_id
        })

      assert result == :ok
    end
  end

  describe "init_analytics" do
    test "calls Analytics.create_site with correct tenant" do
      tenant = Tenants.get_tenant_by_slug("test")

      expect(AnalyticsMock, :create_site, fn t ->
        assert t.id == tenant.id
        :ok
      end)

      perform_job(Tenant, %{
        "type" => "init_analytics",
        "id" => tenant.id
      })
    end

    test "logs error when tenant not found" do
      stub(AnalyticsMock, :create_site, fn _t -> :ok end)

      perform_job(Tenant, %{
        "type" => "init_analytics",
        "id" => 99_999
      })
    end
  end

  describe "notify_created" do
    test "calls Slack notification with correct arguments" do
      tenant = Tenants.get_tenant_by_slug("test")

      expect(SlackMock, :new_lotta_notification, fn t, _users ->
        assert t.id == tenant.id
        %{}
      end)

      expect(SlackMock, :send, fn _msg -> :ok end)

      perform_job(Tenant, %{
        "type" => "notify_created",
        "id" => tenant.id
      })
    end

    test "returns error when tenant not found" do
      result =
        perform_job(Tenant, %{
          "type" => "notify_created",
          "id" => 99_999
        })

      assert result == {:error, :tenant_not_found}
    end
  end

  describe "collect_daily_usage_logs" do
    test "calls create_usage_logs for all tenants" do
      stub(TenantsUsageMock, :create_usage_logs, fn _tenant -> :ok end)

      perform_job(Tenant, %{
        "type" => "collect_daily_usage_logs"
      })
    end

    test "handles errors from individual tenants and continues" do
      tenants = Tenants.list_tenants()

      stub(TenantsUsageMock, :create_usage_logs, fn tenant ->
        if tenant.id == hd(tenants).id do
          {:error, :test_error}
        else
          :ok
        end
      end)

      result =
        perform_job(Tenant, %{
          "type" => "collect_daily_usage_logs"
        })

      assert result == :ok
    end

    test "returns ok even when all tenants fail" do
      stub(TenantsUsageMock, :create_usage_logs, fn _tenant -> {:error, :test_error} end)

      result =
        perform_job(Tenant, %{
          "type" => "collect_daily_usage_logs"
        })

      assert result == :ok
    end
  end

  describe "refresh_monthly_usage_logs" do
    test "refresh_monthly_usage_logs/1 should create the correct job isntance" do
      assert {:ok, job} =
               Tenant.refresh_monthly_usage_logs()

      assert job.worker == "Lotta.Worker.Tenant"
      assert job.args == %{"type" => "refresh_monthly_usage_logs"}
    end

    test "calls Tenants.refresh_monthly_usage_logs with concurrent: true" do
      expect(TenantsUsageMock, :refresh_monthly_usage_logs, fn opts ->
        assert opts == [concurrent: true]
        :ok
      end)

      result =
        perform_job(Tenant, %{
          "type" => "refresh_monthly_usage_logs"
        })

      assert result == :ok
    end

    test "returns ok when refresh succeeds" do
      stub(TenantsUsageMock, :refresh_monthly_usage_logs, fn _opts -> :ok end)

      result =
        perform_job(Tenant, %{
          "type" => "refresh_monthly_usage_logs"
        })

      assert result == :ok
    end

    test "returns error when refresh fails" do
      stub(TenantsUsageMock, :refresh_monthly_usage_logs, fn _opts -> {:error, :test_error} end)

      result =
        perform_job(Tenant, %{
          "type" => "refresh_monthly_usage_logs"
        })

      assert result == {:error, :test_error}
    end
  end

  describe "generate_invoices" do
    test "generate_invoices/0 should create the correct job instance" do
      assert {:ok, job} = Tenant.generate_invoices()

      assert job.worker == "Lotta.Worker.Tenant"
      assert job.args == %{"type" => "generate_invoices"}
    end

    test "calls Billings.generate_invoice for all tenants with valid and not-free current_plan_name" do
      tenant = Tenants.get_tenant_by_slug("test")

      tenant
      |> Ecto.Changeset.change(%{current_plan_name: "default_2025"})
      |> Lotta.Repo.update!(prefix: "public")

      expect(BillingsMock, :generate_invoice, fn _tenant, _year, _month ->
        {:ok, %{id: 1, invoice_number: "LTA00001", total: Decimal.new("14.00")}}
      end)

      result =
        perform_job(Tenant, %{
          "type" => "generate_invoices"
        })

      assert result == :ok
    end

    test "skips tenants without current_plan_name" do
      tenant = Tenants.get_tenant_by_slug("test")

      tenant
      |> Ecto.Changeset.change(%{current_plan_name: nil})
      |> Lotta.Repo.update!(prefix: "public")

      result =
        perform_job(Tenant, %{
          "type" => "generate_invoices"
        })

      assert result == :ok
    end

    test "handles errors from individual tenants and continues" do
      tenant = Tenants.get_tenant_by_slug("test")

      tenant
      |> Ecto.Changeset.change(%{current_plan_name: "test_plan"})
      |> Lotta.Repo.update!(prefix: "public")

      stub(BillingsMock, :generate_invoice, fn _tenant, _year, _month ->
        {:error, :test_error}
      end)

      result =
        perform_job(Tenant, %{
          "type" => "generate_invoices"
        })

      assert result == :ok
    end

    test "generates invoices for the previous month" do
      tenant = Tenants.get_tenant_by_slug("test")

      tenant
      |> Ecto.Changeset.change(%{current_plan_name: "default_2025"})
      |> Lotta.Repo.update!(prefix: "public")

      today = Date.utc_today()
      previous_month_date = Date.add(today, -1)
      expected_year = previous_month_date.year
      expected_month = previous_month_date.month

      expect(BillingsMock, :generate_invoice, fn _tenant, year, month ->
        assert year == expected_year
        assert month == expected_month

        {:ok,
         %{
           id: 1,
           invoice_number: "LTA00001",
           total: Decimal.new("14.00"),
           year: year,
           month: month
         }}
      end)

      perform_job(Tenant, %{
        "type" => "generate_invoices"
      })
    end
  end
end
