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
end
