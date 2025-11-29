defmodule Lotta.TenantsTest do
  @moduledoc false

  use Lotta.WorkerCase

  alias Lotta.Accounts.User
  alias Lotta.{Tenants, Repo}
  alias Lotta.Tenants.{CustomDomain, Tenant, UsageLog}

  @prefix "tenant_test"

  setup do
    Tesla.Mock.mock(fn
      %{url: "https://plausible.io/" <> _rest} = env ->
        %Tesla.Env{env | status: 200, body: "OK"}

      %{method: :post, url: "https://auth.sandbox.eduplaces.dev/oauth2/token"} ->
        %Tesla.Env{status: 200, body: %{"access_token" => "fake_token"}}

      %{url: "https://api.sandbox.eduplaces.dev/idm/ep/v1/" <> _path} ->
        %Tesla.Env{status: 404, body: "Not Found"}
    end)

    :ok
  end

  describe "Tenants" do
    test "should get tenant by prefix" do
      assert %Tenant{prefix: @prefix} = Tenants.get_tenant_by_prefix(@prefix)
    end

    test "should get tenant by slug" do
      assert %Tenant{slug: "test"} = Tenants.get_tenant_by_slug("test")
    end

    test "should get tenant by custom domain" do
      tenant = Tenants.get_tenant_by_slug("test")

      domain = %CustomDomain{
        host: "test-domain.com",
        is_main_domain: true,
        tenant_id: tenant.id
      }

      Repo.insert!(domain)
      assert %Tenant{slug: "test"} = Tenants.get_by_custom_domain("test-domain.com")
    end

    test "should get tenant by eduplaces id" do
      Tenants.get_tenant_by_slug("test")
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_change(:eduplaces_id, "eduplaces-123")
      |> Repo.update!()

      assert %Tenant{slug: "test", eduplaces_id: "eduplaces-123"} =
               Tenants.get_tenant_by_eduplaces_id("eduplaces-123")
    end

    @tag creates_tenant: true
    test "should create a new tenant" do
      tenant = %Tenant{
        title: "Chile Lotta",
        slug: "chile"
      }

      user = %User{
        name: "Salvador Allende",
        email: "salvador.allende@einsa.net"
      }

      assert {:ok, tenant} =
               Tenants.create_tenant(
                 tenant,
                 user
               )

      assert %{title: "Chile Lotta", slug: "chile", prefix: prefix} = tenant
      assert prefix == "tenant_#{tenant.id}"

      assert [%{name: "Salvador Allende", email: "salvador.allende@einsa.net"}] =
               Repo.all(Lotta.Accounts.User, prefix: tenant.prefix)
    end

    @tag creates_tenant: true
    test "should delete a given tenant" do
      tenant = %Tenant{
        title: "Chile Lotta",
        slug: "chile"
      }

      user = %User{
        name: "Salvador Allende",
        email: "salvador.allende@einsa.net"
      }

      assert {:ok, tenant} =
               Tenants.create_tenant(
                 tenant,
                 user
               )

      assert {:ok, _tenant} = Tenants.delete_tenant(tenant)

      assert_raise Postgrex.Error, fn ->
        Repo.all(Lotta.Accounts.User, prefix: tenant.prefix)
      end

      assert is_nil(Tenants.get_tenant(tenant.id))
    end

    test "slug_available?/1 returns false for occupied slugs" do
      assert Tenants.slug_available?("test") == false
    end

    test "slug_available?/1 returns false for reserved slugs" do
      assert Tenants.slug_available?("admin") == false
      assert Tenants.slug_available?("api") == false
      assert Tenants.slug_available?("www") == false
    end

    test "slug_available?/1 returns true for available slugs" do
      assert Tenants.slug_available?("available-slug") == true
    end

    @tag creates_tenant: true
    test "can create tenant without address" do
      tenant = %Tenant{
        title: "No Address School",
        slug: "no-address"
      }

      user = %User{
        name: "Test",
        email: "test@example.com"
      }

      assert {:ok, created_tenant} = Tenants.create_tenant(tenant, user)
      assert created_tenant.address == nil
    end

    test "get_occupied_slugs/0 returns list of occupied slugs" do
      occupied_slugs = Tenants.get_occupied_slugs()
      assert "test" in occupied_slugs
    end

    test "get_reserved_slugs/0 returns list of reserved slugs" do
      reserved_slugs = Tenants.get_reserved_slugs()
      assert "admin" in reserved_slugs
      assert "api" in reserved_slugs
      assert "www" in reserved_slugs
    end

    @tag creates_tenant: true
    test "should create a new tenant with eduplaces user" do
      import Mock

      tenant = %Tenant{
        title: "Eduplaces School",
        slug: "eduplaces"
      }

      user = %User{
        eduplaces_id: "eduplaces-user-123"
      }

      with_mock(
        Lotta.Accounts,
        [:passthrough],
        register_eduplaces_user: fn tenant, _user_info ->
          {:ok,
           %User{
             id: 999,
             name: "Test User",
             email: "test@eduplaces.com",
             eduplaces_id: "eduplaces-user-123",
             groups: []
           }
           |> Repo.insert!(prefix: tenant.prefix)}
        end
      ) do
        assert {:ok, tenant} = Tenants.create_tenant(tenant, user)

        assert %{title: "Eduplaces School", slug: "eduplaces", prefix: prefix} = tenant
        assert prefix == "tenant_#{tenant.id}"

        assert_called(
          Lotta.Accounts.register_eduplaces_user(tenant, %Lotta.Eduplaces.UserInfo{
            id: "eduplaces-user-123"
          })
        )
      end
    end

    @tag creates_tenant: true
    test "should fail to create tenant when neither email nor eduplaces_id is provided" do
      tenant = %Tenant{
        title: "Invalid User Tenant",
        slug: "invalid"
      }

      user = %User{
        name: "Test User"
      }

      assert {:error, _} = Tenants.create_tenant(tenant, user)
    end
  end

  describe "create_usage_log_entry/4" do
    test "creates a usage log entry with valid parameters" do
      tenant = Tenants.get_tenant_by_slug("test")

      assert {:ok, usage_log} =
               Tenants.create_usage_log_entry(
                 tenant,
                 :active_user_count,
                 "150",
                 "user-123"
               )

      assert usage_log.tenant_id == tenant.id
      assert usage_log.type == :active_user_count
      assert usage_log.value == "150"
      assert usage_log.unique_identifier == "user-123"
      assert usage_log.date == Date.utc_today()

      # Verify it was saved to the database
      saved_log = Repo.get_by(UsageLog, [tenant_id: tenant.id], prefix: "public")
      assert saved_log.value == "150"
    end

    test "creates a usage log entry for total_storage_count type" do
      tenant = Tenants.get_tenant_by_slug("test")

      assert {:ok, usage_log} =
               Tenants.create_usage_log_entry(
                 tenant,
                 :total_storage_count,
                 "52428800",
                 "storage-report-2025-10"
               )

      assert usage_log.type == :total_storage_count
      assert usage_log.value == "52428800"
      assert usage_log.unique_identifier == "storage-report-2025-10"
    end

    test "creates a usage log entry for media_conversion_seconds type" do
      tenant = Tenants.get_tenant_by_slug("test")

      assert {:ok, usage_log} =
               Tenants.create_usage_log_entry(
                 tenant,
                 :media_conversion_seconds,
                 "3600"
               )

      assert usage_log.type == :media_conversion_seconds
      assert usage_log.value == "3600"
      assert usage_log.unique_identifier == nil
    end

    test "creates a usage log entry without unique_identifier (defaults to nil)" do
      tenant = Tenants.get_tenant_by_slug("test")

      assert {:ok, usage_log} =
               Tenants.create_usage_log_entry(
                 tenant,
                 :active_user_count,
                 "200"
               )

      assert usage_log.unique_identifier == nil
    end

    test "automatically sets date to today" do
      tenant = Tenants.get_tenant_by_slug("test")

      assert {:ok, usage_log} =
               Tenants.create_usage_log_entry(
                 tenant,
                 :active_user_count,
                 "100"
               )

      assert usage_log.date == Date.utc_today()
    end

    test "returns error with invalid type" do
      tenant = Tenants.get_tenant_by_slug("test")

      assert {:error, changeset} =
               Tenants.create_usage_log_entry(
                 tenant,
                 :invalid_type,
                 "100"
               )

      assert changeset.errors[:type]
    end

    test "returns error when value is missing" do
      tenant = Tenants.get_tenant_by_slug("test")

      assert {:error, changeset} =
               Tenants.create_usage_log_entry(
                 tenant,
                 :active_user_count,
                 nil
               )

      assert changeset.errors[:value]
    end
  end

  describe "create_total_storage_log/1" do
    test "creates a log entry with total storage sum" do
      tenant = Tenants.get_tenant_by_slug("test")

      # Get current total
      current_total =
        from(f in Lotta.Storage.File, select: sum(f.filesize))
        |> Repo.one(prefix: tenant.prefix)
        |> case do
          nil -> 0
          sum -> sum
        end

      assert {:ok, usage_log} = Tenants.create_total_storage_log(tenant)

      assert usage_log.type == :total_storage_count
      assert usage_log.value == to_string(current_total)
      assert usage_log.tenant_id == tenant.id
      assert usage_log.date == Date.utc_today()
      assert usage_log.unique_identifier == nil
    end

    test "creates a log entry with 0 when no files exist" do
      tenant = Tenants.get_tenant_by_slug("test")

      # Delete all files
      Repo.delete_all(Lotta.Storage.File, prefix: tenant.prefix)

      assert {:ok, usage_log} = Tenants.create_total_storage_log(tenant)

      assert usage_log.type == :total_storage_count
      assert usage_log.value == "0"
      assert usage_log.tenant_id == tenant.id
    end
  end

  describe "create_active_user_count_log/1" do
    test "creates a log entry with count of users with groups" do
      tenant = Tenants.get_tenant_by_slug("test")

      # Count existing users
      total_users = Repo.aggregate(Lotta.Accounts.User, :count, :id, prefix: tenant.prefix)

      Repo.put_prefix(tenant.prefix)
      users_without_groups = Lotta.Accounts.list_users_without_groups()
      expected_count = total_users - length(users_without_groups)

      assert {:ok, usage_log} = Tenants.create_active_user_count_log(tenant)

      assert usage_log.type == :active_user_count
      assert usage_log.value == to_string(expected_count)
      assert usage_log.tenant_id == tenant.id
      assert usage_log.date == Date.utc_today()
      assert usage_log.unique_identifier == nil
    end
  end

  describe "create_usage_logs/1" do
    test "creates both storage and user count logs" do
      tenant = Tenants.get_tenant_by_slug("test")

      assert :ok = Tenants.create_usage_logs(tenant)

      # Verify both logs were created
      storage_log =
        Repo.get_by(UsageLog, [tenant_id: tenant.id, type: :total_storage_count],
          prefix: "public"
        )

      user_count_log =
        Repo.get_by(UsageLog, [tenant_id: tenant.id, type: :active_user_count], prefix: "public")

      assert storage_log != nil
      assert user_count_log != nil
      assert storage_log.date == Date.utc_today()
      assert user_count_log.date == Date.utc_today()
    end
  end

  describe "refresh_monthly_usage_logs/1" do
    test "refreshes the materialized view successfully" do
      assert :ok = Tenants.refresh_monthly_usage_logs()
    end

    test "refreshes with concurrent option set to true" do
      assert :ok = Tenants.refresh_monthly_usage_logs(concurrent: true)
    end

    test "refreshes with concurrent option set to false" do
      assert :ok = Tenants.refresh_monthly_usage_logs(concurrent: false)
    end
  end

  describe "get_monthly_usage_logs/2" do
    setup do
      tenant = Tenants.get_tenant_by_slug("test")

      # Create some usage logs for different months
      {:ok, _} =
        Tenants.create_usage_log_entry(
          tenant,
          :active_user_count,
          "100",
          "2025-01-test"
        )

      {:ok, _} =
        Tenants.create_usage_log_entry(
          tenant,
          :total_storage_count,
          "5000000",
          "2025-01-storage"
        )

      {:ok, _} =
        Tenants.create_usage_log_entry(
          tenant,
          :media_conversion_seconds,
          "3600"
        )

      # Add another entry for the same month/type to test averaging
      %UsageLog{}
      |> UsageLog.changeset(%{
        tenant_id: tenant.id,
        type: :active_user_count,
        value: "200",
        date: Date.utc_today(),
        unique_identifier: "2025-01-test-2"
      })
      |> Repo.insert!(prefix: "public")

      # Refresh the materialized view
      Tenants.refresh_monthly_usage_logs()

      {:ok, tenant: tenant}
    end

    test "returns monthly usage logs for a tenant", %{tenant: tenant} do
      logs = Tenants.get_monthly_usage_logs(tenant)

      assert length(logs) > 0
      assert Enum.all?(logs, fn log -> log.tenant_id == tenant.id end)
    end

    test "filters by type", %{tenant: tenant} do
      logs = Tenants.get_monthly_usage_logs(tenant, type: :active_user_count)

      assert length(logs) > 0
      assert Enum.all?(logs, fn log -> log.type == :active_user_count end)
    end

    test "filters by year and month", %{tenant: tenant} do
      today = Date.utc_today()

      logs =
        Tenants.get_monthly_usage_logs(tenant,
          year: today.year,
          month: today.month
        )

      assert length(logs) > 0
      assert Enum.all?(logs, fn log -> log.year == today.year and log.month == today.month end)
    end

    test "combines type, year, and month filters", %{tenant: tenant} do
      today = Date.utc_today()

      logs =
        Tenants.get_monthly_usage_logs(tenant,
          type: :active_user_count,
          year: today.year,
          month: today.month
        )

      assert Enum.all?(logs, fn log ->
               log.type == :active_user_count and log.year == today.year and
                 log.month == today.month
             end)
    end

    test "limits results", %{tenant: tenant} do
      # Without filter, we have 3 types of usage logs, so limit: 2 should return 2 results
      logs = Tenants.get_monthly_usage_logs(tenant, limit: 2)

      assert length(logs) == 2
    end

    test "calculates average for active_user_count type", %{tenant: tenant} do
      today = Date.utc_today()

      logs =
        Tenants.get_monthly_usage_logs(tenant,
          type: :active_user_count,
          year: today.year,
          month: today.month
        )

      # Should average 100 and 200 = 150
      assert length(logs) > 0
      log = hd(logs)
      assert Decimal.equal?(log.value, Decimal.new("150"))
    end

    test "calculates sum for media_conversion_seconds type", %{tenant: tenant} do
      today = Date.utc_today()

      logs =
        Tenants.get_monthly_usage_logs(tenant,
          type: :media_conversion_seconds,
          year: today.year,
          month: today.month
        )

      assert length(logs) > 0
      log = hd(logs)
      assert Decimal.equal?(log.value, Decimal.new("3600"))
    end

    test "returns empty list for non-existent tenant" do
      # Create a tenant struct with a non-existent ID
      fake_tenant = %Lotta.Tenants.Tenant{id: 99_999}
      logs = Tenants.get_monthly_usage_logs(fake_tenant)

      assert logs == []
    end

    test "orders results by year desc, month desc, type asc", %{tenant: tenant} do
      logs = Tenants.get_monthly_usage_logs(tenant)

      # Verify ordering
      sorted_logs =
        Enum.sort_by(logs, fn log ->
          {-log.year, -log.month, Atom.to_string(log.type)}
        end)

      assert logs == sorted_logs
    end
  end

  describe "Usage.get_usage/1" do
    setup do
      tenant = Tenants.get_tenant_by_slug("test")

      # Create some usage logs for different months
      {:ok, _} =
        Tenants.create_usage_log_entry(
          tenant,
          :active_user_count,
          "100",
          "2025-01-test"
        )

      {:ok, _} =
        Tenants.create_usage_log_entry(
          tenant,
          :total_storage_count,
          "5000000",
          "2025-01-storage"
        )

      {:ok, _} =
        Tenants.create_usage_log_entry(
          tenant,
          :media_conversion_seconds,
          "3600"
        )

      # Refresh the materialized view
      Tenants.refresh_monthly_usage_logs()

      {:ok, tenant: tenant}
    end

    test "returns usage grouped by year and month", %{tenant: tenant} do
      alias Lotta.Tenants.Usage

      assert {:ok, result} = Usage.get_usage(tenant)

      assert is_list(result)
      assert length(result) > 0

      # Check that each entry has the expected structure
      Enum.each(result, fn entry ->
        assert is_integer(entry.year)
        assert is_integer(entry.month)
        assert entry.month >= 1 and entry.month <= 12
      end)
    end

    test "includes all usage types", %{tenant: tenant} do
      alias Lotta.Tenants.Usage

      assert {:ok, [entry | _]} = Usage.get_usage(tenant)

      # Check that usage types are present
      assert entry.active_user_count != nil
      assert entry.total_storage_count != nil
      assert entry.media_conversion_seconds != nil
    end

    test "sorts results by year and month descending", %{tenant: tenant} do
      alias Lotta.Tenants.Usage

      assert {:ok, result} = Usage.get_usage(tenant)

      # Verify ordering (most recent first)
      sorted_result =
        Enum.sort_by(result, fn %{year: year, month: month} -> {year, month} end, :desc)

      assert result == sorted_result
    end
  end

  describe "Usage.get_usage/3" do
    setup do
      tenant = Tenants.get_tenant_by_slug("test")

      # Create usage logs for specific month
      {:ok, _} =
        Tenants.create_usage_log_entry(
          tenant,
          :active_user_count,
          "150",
          "specific-month-test"
        )

      {:ok, _} =
        Tenants.create_usage_log_entry(
          tenant,
          :total_storage_count,
          "8000000",
          "specific-month-storage"
        )

      {:ok, _} =
        Tenants.create_usage_log_entry(
          tenant,
          :media_conversion_seconds,
          "7200"
        )

      # Refresh the materialized view
      Tenants.refresh_monthly_usage_logs()

      {:ok, tenant: tenant}
    end

    test "returns usage for specific year and month", %{tenant: tenant} do
      alias Lotta.Tenants.Usage
      today = Date.utc_today()

      assert usage_data = Usage.get_usage(tenant, today.year, today.month)

      assert usage_data != nil
      assert usage_data.year == today.year
      assert usage_data.month == today.month
      assert usage_data.active_user_count != nil
      assert usage_data.total_storage_count != nil
      assert usage_data.media_conversion_seconds != nil
    end

    test "returns nil when no data exists for the period", %{tenant: tenant} do
      alias Lotta.Tenants.Usage

      # Query for a month in the future that has no data
      assert is_nil(Usage.get_usage(tenant, 2099, 12))
    end

    test "returns correct usage values for the period", %{tenant: tenant} do
      alias Lotta.Tenants.Usage
      today = Date.utc_today()

      assert usage_data = Usage.get_usage(tenant, today.year, today.month)

      assert usage_data.active_user_count.value != nil
      assert usage_data.total_storage_count.value != nil
      assert usage_data.media_conversion_seconds.value != nil
    end
  end

  describe "Tenant.generate_slug/1" do
    test "generates slug from title with lowercase and dashes" do
      assert Tenant.generate_slug("My Cool School") == "my-cool-school"
    end

    test "replaces special characters with dashes" do
      assert Tenant.generate_slug("Schüle für Künste & Wissenschaft!") ==
               "sch-le-f-r-k-nste-wissenschaft"
    end

    test "handles German umlauts and special characters" do
      assert Tenant.generate_slug("Schule für Überlegene Bildung") ==
               "schule-f-r-berlegene-bildung"
    end

    test "removes leading and trailing dashes" do
      assert Tenant.generate_slug("!!!My School!!!") == "my-school"
      assert Tenant.generate_slug("   School   ") == "school"
    end

    test "handles multiple consecutive special characters" do
      assert Tenant.generate_slug("My---Cool___School") == "my-cool-school"
    end

    test "handles numbers in title" do
      assert Tenant.generate_slug("School 123") == "school-123"
      assert Tenant.generate_slug("42 Academy") == "42-academy"
    end

    test "handles empty string" do
      assert Tenant.generate_slug("") == ""
    end

    test "handles string with only special characters" do
      assert Tenant.generate_slug("!!!@@@###") == ""
    end

    test "finds available slug when base slug is occupied" do
      import Mock

      # Mock slug_available? to return false for "test" and true for "test-2"
      with_mock(Tenants, [:passthrough],
        slug_available?: fn
          "test" -> false
          "test-2" -> true
          _ -> true
        end
      ) do
        assert Tenant.generate_slug("Test") == "test-2"
      end
    end

    test "increments suffix until available slug is found" do
      import Mock

      # Mock slug_available? to return false for "school" through "school-5", true for "school-6"
      with_mock(Tenants, [:passthrough],
        slug_available?: fn
          "school" -> false
          "school-2" -> false
          "school-3" -> false
          "school-4" -> false
          "school-5" -> false
          "school-6" -> true
          _ -> true
        end
      ) do
        assert Tenant.generate_slug("School") == "school-6"
      end
    end

    test "returns nil when no available slug found within 1000 attempts" do
      import Mock

      # Mock slug_available? to always return false
      with_mock(Tenants, [:passthrough], slug_available?: fn _ -> false end) do
        assert Tenant.generate_slug("School") == nil
      end
    end

    test "returns base slug when it's available" do
      import Mock

      # Mock slug_available? to return true for any slug
      with_mock(Tenants, [:passthrough], slug_available?: fn _ -> true end) do
        assert Tenant.generate_slug("Available School") == "available-school"
      end
    end

    test "handles complex real-world school names" do
      import Mock

      with_mock(Tenants, [:passthrough], slug_available?: fn _ -> true end) do
        assert Tenant.generate_slug("Gymnasium St. Maria-Magdalena") ==
                 "gymnasium-st-maria-magdalena"

        assert Tenant.generate_slug("École Française de Berlin") == "cole-fran-aise-de-berlin"
        # Chinese characters get removed
        assert Tenant.generate_slug("北京第一中学") == ""
        # Cyrillic gets removed, numbers stay
        assert Tenant.generate_slug("Школа №42") == "42"
      end
    end

    test "handles very long titles" do
      import Mock

      with_mock(Tenants, [:passthrough], slug_available?: fn _ -> true end) do
        long_title = String.duplicate("Very Long School Name ", 10)
        slug = Tenant.generate_slug(long_title)
        assert slug == String.duplicate("very-long-school-name-", 9) <> "very-long-school-name"
        assert String.length(slug) > 200
      end
    end
  end

  describe "Billing" do
    @tag creates_tenant: true
    test "should auto-assign default plan on tenant creation" do
      tenant = %Tenant{
        title: "Billing Test Lotta",
        slug: "billing-test"
      }

      user = %User{
        name: "Test User",
        email: "test@example.com"
      }

      assert {:ok, created_tenant} = Tenants.create_tenant(tenant, user)

      {default_plan_name, default_plan} = Lotta.Billings.Plans.get_default()
      assert created_tenant.current_plan_name == default_plan_name
      assert created_tenant.current_plan_expires_at != nil
      assert created_tenant.next_plan_name == default_plan[:default_next_plan]

      expected_expiration =
        Date.utc_today()
        |> Date.shift(month: 1)
        |> Date.beginning_of_month()
        |> Date.shift(default_plan[:default_duration])

      assert created_tenant.current_plan_expires_at == expected_expiration
    end

    @tag creates_tenant: true
    test "tenant creation calculates expiration at beginning of next month" do
      tenant = %Tenant{
        title: "Timing Test",
        slug: "timing-test"
      }

      user = %User{
        name: "Test",
        email: "timing@test.com"
      }

      {:ok, created_tenant} = Tenants.create_tenant(tenant, user)

      assert Date.compare(
               created_tenant.current_plan_expires_at,
               Date.utc_today()
             ) == :gt

      assert created_tenant.current_plan_expires_at.day == 1
    end

    test "update_plan/4 should update tenant's plan" do
      tenant = Tenants.get_tenant_by_slug("test")
      new_expires_at = Date.add(Date.utc_today(), 30)

      assert {:ok, updated_tenant} =
               Tenants.update_plan(tenant, "supporter", new_expires_at, "supporter")

      assert updated_tenant.current_plan_name == "supporter"
      assert updated_tenant.current_plan_expires_at == new_expires_at
      assert updated_tenant.next_plan_name == "supporter"
    end

    test "update_plan/4 should auto-calculate expiration and next plan" do
      tenant = Tenants.get_tenant_by_slug("test")

      assert {:ok, updated_tenant} = Tenants.update_plan(tenant, "supporter")

      assert updated_tenant.current_plan_name == "supporter"
      assert updated_tenant.current_plan_expires_at != nil
      assert updated_tenant.next_plan_name == "supporter"

      # Supporter plan has 1 month duration
      expected_expiration = Date.shift(Date.utc_today(), month: 1)
      assert updated_tenant.current_plan_expires_at == expected_expiration
    end

    test "get_current_plan/1 returns plan configuration" do
      tenant = Tenants.get_tenant_by_slug("test")

      # First update to a known plan
      {:ok, tenant} = Tenants.update_plan(tenant, "supporter")

      plan = Tenants.get_current_plan(tenant)

      assert is_map(plan)
      assert plan.title == "Lotta"
      assert plan.user_max_storage == 1
      assert plan.media_conversion_minutes == 15
    end

    test "get_current_plan/1 returns nil when no plan assigned" do
      tenant = Tenants.get_tenant_by_slug("test")

      # Clear the plan
      tenant
      |> Ecto.Changeset.change(%{current_plan_name: nil})
      |> Repo.update!(prefix: "public")

      tenant = Tenants.get_tenant_by_slug("test")
      assert Tenants.get_current_plan(tenant) == nil
    end

    test "plan_expired?/1 returns false for unexpired plan" do
      tenant = Tenants.get_tenant_by_slug("test")
      future_date = Date.add(Date.utc_today(), 30)

      {:ok, tenant} = Tenants.update_plan(tenant, "supporter", future_date, "supporter")

      assert Tenants.plan_expired?(tenant) == false
    end

    test "plan_expired?/1 returns true for expired plan" do
      tenant = Tenants.get_tenant_by_slug("test")
      past_date = Date.add(Date.utc_today(), -30)

      {:ok, tenant} = Tenants.update_plan(tenant, "supporter", past_date, "supporter")

      assert Tenants.plan_expired?(tenant) == true
    end

    test "plan_expired?/1 returns false when no expiration date" do
      tenant = Tenants.get_tenant_by_slug("test")

      tenant
      |> Ecto.Changeset.change(%{current_plan_expires_at: nil})
      |> Repo.update!(prefix: "public")

      tenant = Tenants.get_tenant_by_slug("test")
      assert Tenants.plan_expired?(tenant) == false
    end

    test "renew_plan/1 renews to next plan" do
      tenant = Tenants.get_tenant_by_slug("test")
      past_date = Date.add(Date.utc_today(), -30)

      # Set up an expired supporter plan that renews to supporter
      {:ok, tenant} = Tenants.update_plan(tenant, "supporter", past_date, "supporter")

      assert {:ok, renewed_tenant} = Tenants.renew_plan(tenant)

      # Should still be on supporter plan
      assert renewed_tenant.current_plan_name == "supporter"
      assert renewed_tenant.next_plan_name == "supporter"

      # Should have new expiration date (1 month from now)
      expected_expiration = Date.shift(Date.utc_today(), month: 1)
      assert renewed_tenant.current_plan_expires_at == expected_expiration
    end

    test "renew_plan/1 clears plan when no next plan" do
      tenant = Tenants.get_tenant_by_slug("test")
      past_date = Date.add(Date.utc_today(), -30)

      # Set up an expired test plan with no next plan
      {:ok, tenant} = Tenants.update_plan(tenant, "test", past_date, nil)

      assert {:ok, renewed_tenant} = Tenants.renew_plan(tenant)

      # Plan should be cleared
      assert renewed_tenant.current_plan_name == nil
      assert renewed_tenant.current_plan_expires_at == nil
      assert renewed_tenant.next_plan_name == nil
    end
  end
end
