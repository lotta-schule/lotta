defmodule Lotta.Worker.TenantTest do
  use Lotta.WorkerCase, async: false

  import Mock

  alias Lotta.Worker.Tenant
  alias Lotta.{Fixtures, Tenants}
  alias Lotta.Tenants.DefaultContent
  alias Lotta.Analytics
  alias Lotta.Administration.Notification.Slack

  describe "setup" do
    test "calls DefaultContent.create_default_content with correct arguments" do
      tenant = Tenants.get_tenant_by_slug("test")
      user = Fixtures.fixture(:registered_user)

      with_mock(DefaultContent, create_default_content: fn _t, _u -> :ok end) do
        with_mock(Analytics, create_site: fn _t -> :ok end) do
          with_mock(Slack, [:passthrough], send: fn _msg -> :ok end) do
            perform_job(Tenant, %{
              "type" => "setup",
              "id" => tenant.id,
              "user_email" => user.email,
              "user_password" => "test_password",
              "eduplaces_id" => nil
            })

            assert_called(DefaultContent.create_default_content(tenant, :_))
          end
        end
      end
    end

    test "handles eduplaces_id when provided" do
      tenant = Tenants.get_tenant_by_slug("test")

      # Create a user with eduplaces_id
      user =
        Fixtures.fixture(:registered_eduplace_user, %{
          eduplaces_id: "test_eduplaces_id"
        })

      with_mock(DefaultContent, create_default_content: fn _t, _u -> :ok end) do
        with_mock(Analytics, create_site: fn _t -> :ok end) do
          with_mock(Slack, [:passthrough], send: fn _msg -> :ok end) do
            result =
              perform_job(Tenant, %{
                "type" => "setup",
                "id" => tenant.id,
                "user_email" => nil,
                "user_password" => "test_password",
                "eduplaces_id" => user.eduplaces_id
              })

            assert result == :ok
            assert_called(DefaultContent.create_default_content(tenant, :_))
          end
        end
      end
    end
  end

  describe "init_analytics" do
    test "calls Analytics.create_site with correct tenant" do
      tenant = Tenants.get_tenant_by_slug("test")

      with_mock(Analytics, create_site: fn _t -> :ok end) do
        perform_job(Tenant, %{
          "type" => "init_analytics",
          "id" => tenant.id
        })

        assert_called(Analytics.create_site(tenant))
      end
    end

    test "logs error when tenant not found" do
      with_mock(Analytics, create_site: fn _t -> :ok end) do
        # The job returns :error but Oban wraps it
        perform_job(Tenant, %{
          "type" => "init_analytics",
          "id" => 99_999
        })

        # Verify Analytics was not called
        refute called(Analytics.create_site(:_))
      end
    end
  end

  describe "notify_created" do
    test "calls Slack notification with correct arguments" do
      tenant = Tenants.get_tenant_by_slug("test")

      with_mock(Slack, [:passthrough],
        new_lotta_notification: fn _t, _users -> %{} end,
        send: fn _msg -> :ok end
      ) do
        perform_job(Tenant, %{
          "type" => "notify_created",
          "id" => tenant.id
        })

        assert_called(Slack.new_lotta_notification(tenant, :_))
        assert_called(Slack.send(:_))
      end
    end

    test "returns error when tenant not found" do
      with_mock(Slack, [:passthrough],
        new_lotta_notification: fn _t, _users -> %{} end,
        send: fn _msg -> :ok end
      ) do
        result =
          perform_job(Tenant, %{
            "type" => "notify_created",
            "id" => 99_999
          })

        assert result == {:error, :tenant_not_found}
        refute called(Slack.new_lotta_notification(:_, :_))
      end
    end
  end

  describe "collect_daily_usage_logs" do
    test "calls create_usage_logs for all tenants" do
      with_mock(Tenants, [:passthrough], create_usage_logs: fn _tenant -> :ok end) do
        perform_job(Tenant, %{
          "type" => "collect_daily_usage_logs"
        })

        # Should be called at least once for the test tenant
        assert called(Tenants.create_usage_logs(:_))
      end
    end

    test "handles errors from individual tenants and continues" do
      tenants = Tenants.list_tenants()

      with_mock(Tenants, [:passthrough],
        create_usage_logs: fn tenant ->
          # Fail for first tenant, succeed for others
          if tenant.id == hd(tenants).id do
            {:error, :test_error}
          else
            :ok
          end
        end
      ) do
        result =
          perform_job(Tenant, %{
            "type" => "collect_daily_usage_logs"
          })

        # Job should complete successfully even if some tenants fail
        assert result == :ok

        # Should still be called for all tenants
        assert called(Tenants.create_usage_logs(:_))
      end
    end

    test "returns ok even when all tenants fail" do
      with_mock(Tenants, [:passthrough],
        create_usage_logs: fn _tenant -> {:error, :test_error} end
      ) do
        result =
          perform_job(Tenant, %{
            "type" => "collect_daily_usage_logs"
          })

        assert result == :ok
      end
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
      with_mock(Tenants, [:passthrough], refresh_monthly_usage_logs: fn _opts -> :ok end) do
        result =
          perform_job(Tenant, %{
            "type" => "refresh_monthly_usage_logs"
          })

        assert result == :ok
        assert called(Tenants.refresh_monthly_usage_logs(concurrent: true))
      end
    end

    test "returns ok when refresh succeeds" do
      with_mock(Tenants, [:passthrough], refresh_monthly_usage_logs: fn _opts -> :ok end) do
        result =
          perform_job(Tenant, %{
            "type" => "refresh_monthly_usage_logs"
          })

        assert result == :ok
      end
    end

    test "returns error when refresh fails" do
      with_mock(Tenants, [:passthrough],
        refresh_monthly_usage_logs: fn _opts -> {:error, :test_error} end
      ) do
        result =
          perform_job(Tenant, %{
            "type" => "refresh_monthly_usage_logs"
          })

        assert result == {:error, :test_error}
      end
    end
  end

  describe "generate_invoices" do
    alias Lotta.Billings

    test "generate_invoices/0 should create the correct job instance" do
      assert {:ok, job} = Tenant.generate_invoices()

      assert job.worker == "Lotta.Worker.Tenant"
      assert job.args == %{"type" => "generate_invoices"}
    end

    test "calls Billings.generate_invoice for all tenants with current_plan_name" do
      # Set up tenant with a plan
      tenant = Tenants.get_tenant_by_slug("test")

      tenant =
        tenant
        |> Ecto.Changeset.change(%{current_plan_name: "test_plan"})
        |> Lotta.Repo.update!(prefix: "public")

      # Mock the generate_invoice function
      with_mock(Billings, [:passthrough],
        generate_invoice: fn _tenant, _year, _month ->
          {:ok, %{id: 1, invoice_number: "LTA00001"}}
        end
      ) do
        result =
          perform_job(Tenant, %{
            "type" => "generate_invoices"
          })

        assert result == :ok
        # Should be called at least once for our test tenant with a plan
        assert called(Billings.generate_invoice(tenant, :_, :_))
      end
    end

    test "skips tenants without current_plan_name" do
      # Ensure test tenant has no plan
      tenant = Tenants.get_tenant_by_slug("test")

      tenant
      |> Ecto.Changeset.change(%{current_plan_name: nil})
      |> Lotta.Repo.update!(prefix: "public")

      with_mock(Billings, [:passthrough],
        generate_invoice: fn _tenant, _year, _month ->
          {:ok, %{id: 1, invoice_number: "LTA00001"}}
        end
      ) do
        result =
          perform_job(Tenant, %{
            "type" => "generate_invoices"
          })

        assert result == :ok
        # Should not be called for tenant without plan
        refute called(Billings.generate_invoice(:_, :_, :_))
      end
    end

    test "handles errors from individual tenants and continues" do
      # Set up tenant with a plan
      tenant = Tenants.get_tenant_by_slug("test")

      tenant
      |> Ecto.Changeset.change(%{current_plan_name: "test_plan"})
      |> Lotta.Repo.update!(prefix: "public")

      with_mock(Billings, [:passthrough],
        generate_invoice: fn _tenant, _year, _month ->
          {:error, :test_error}
        end
      ) do
        result =
          perform_job(Tenant, %{
            "type" => "generate_invoices"
          })

        # Job should complete successfully even if invoice generation fails
        assert result == :ok
      end
    end

    test "generates invoices for the previous month" do
      # Set up tenant with a plan
      tenant = Tenants.get_tenant_by_slug("test")

      tenant
      |> Ecto.Changeset.change(%{current_plan_name: "test_plan"})
      |> Lotta.Repo.update!(prefix: "public")

      # Calculate expected previous month
      today = Date.utc_today()
      previous_month_date = Date.add(today, -1)
      expected_year = previous_month_date.year
      expected_month = previous_month_date.month

      with_mock(Billings, [:passthrough],
        generate_invoice: fn _tenant, year, month ->
          {:ok, %{id: 1, invoice_number: "LTA00001", year: year, month: month}}
        end
      ) do
        perform_job(Tenant, %{
          "type" => "generate_invoices"
        })

        # Verify it was called with the previous month's year and month
        assert called(Billings.generate_invoice(:_, expected_year, expected_month))
      end
    end
  end
end
