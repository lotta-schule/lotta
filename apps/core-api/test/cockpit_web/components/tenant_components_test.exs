defmodule CockpitWeb.TenantComponentsTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: true

  import Phoenix.LiveViewTest
  import Phoenix.Component
  import CockpitWeb.TenantComponents

  describe "monthly_usage_logs_list/1" do
    test "renders table with usage data" do
      usages = [
        %{
          year: 2024,
          month: 1,
          active_user_count: %{value: Decimal.new("150.5")},
          total_storage_count: %{value: Decimal.new("1024.567")},
          media_conversion_seconds: %{value: Decimal.new("3600.25")}
        },
        %{
          year: 2024,
          month: 2,
          active_user_count: %{value: Decimal.new("175.8")},
          total_storage_count: %{value: Decimal.new("2048.123")},
          media_conversion_seconds: %{value: Decimal.new("4320.75")}
        }
      ]

      assigns = %{usages: usages}

      html =
        rendered_to_string(~H"""
        <.monthly_usage_logs_list usages={@usages} />
        """)

      assert html =~ ~s|class="table w-full"|
      assert html =~ "monthly usage logs"
      assert html =~ "year"
      assert html =~ "month"
      assert html =~ "active users"
      assert html =~ "total storage"
      assert html =~ "media conversion"
    end

    test "formats usage values correctly" do
      usages = [
        %{
          year: 2024,
          month: 3,
          active_user_count: %{value: Decimal.new("123.456")},
          total_storage_count: %{value: Decimal.new("1073741824")},
          media_conversion_seconds: %{value: Decimal.new("3661")}
        }
      ]

      assigns = %{usages: usages}

      html =
        rendered_to_string(~H"""
        <.monthly_usage_logs_list usages={@usages} />
        """)

      # active_user_count rounded to 0 decimals: 123
      assert html =~ ">123<"
      # total_storage_count formatted as filesize (1GB in bytes)
      assert html =~ "1 GB"
      # media_conversion_seconds formatted as duration (1 hour, 1 minute, 1 second)
      assert html =~ "eine Stunde"
    end

    test "renders year-month correctly" do
      usages = [
        %{
          year: 2024,
          month: 11,
          active_user_count: %{value: Decimal.new("100")},
          total_storage_count: %{value: Decimal.new("500")},
          media_conversion_seconds: %{value: Decimal.new("1000")}
        }
      ]

      assigns = %{usages: usages}

      html =
        rendered_to_string(~H"""
        <.monthly_usage_logs_list usages={@usages} />
        """)

      assert html =~ "2024-11"
    end

    test "handles nil values gracefully" do
      usages = [
        %{
          year: 2024,
          month: 5,
          active_user_count: %{value: nil},
          total_storage_count: %{value: nil},
          media_conversion_seconds: %{value: nil}
        }
      ]

      assigns = %{usages: usages}

      html =
        rendered_to_string(~H"""
        <.monthly_usage_logs_list usages={@usages} />
        """)

      # Should render without errors
      assert html =~ "2024-5"
      assert html =~ ~s|class="table w-full"|
    end

    test "renders empty table when no usages provided" do
      assigns = %{usages: []}

      html =
        rendered_to_string(~H"""
        <.monthly_usage_logs_list usages={@usages} />
        """)

      assert html =~ ~s|class="table w-full"|
      assert html =~ "monthly usage logs"
      # Should still have header row
      assert html =~ "<thead>"
    end

    test "renders multiple usage entries" do
      usages = [
        %{
          year: 2024,
          month: 1,
          active_user_count: %{value: Decimal.new("100")},
          total_storage_count: %{value: Decimal.new("500")},
          media_conversion_seconds: %{value: Decimal.new("1000")}
        },
        %{
          year: 2024,
          month: 2,
          active_user_count: %{value: Decimal.new("150")},
          total_storage_count: %{value: Decimal.new("600")},
          media_conversion_seconds: %{value: Decimal.new("1200")}
        },
        %{
          year: 2024,
          month: 3,
          active_user_count: %{value: Decimal.new("200")},
          total_storage_count: %{value: Decimal.new("700")},
          media_conversion_seconds: %{value: Decimal.new("1400")}
        }
      ]

      assigns = %{usages: usages}

      html =
        rendered_to_string(~H"""
        <.monthly_usage_logs_list usages={@usages} />
        """)

      assert html =~ "2024-1"
      assert html =~ "2024-2"
      assert html =~ "2024-3"
      assert html =~ ">100<"
      assert html =~ ">150<"
      assert html =~ ">200<"
    end
  end
end
