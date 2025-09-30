defmodule Lotta.AnalyticsTest do
  @moduledoc false

  use Lotta.DataCase

  alias Lotta.Analytics
  alias Lotta.Tenants

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Tesla.Mock.mock(fn
      %Tesla.Env{
        method: :get,
        url: "https://plausible.io/api/v1/stats/realtime/visitors",
        query: [site_id: "test.lotta.schule"],
        headers: [
          {_, _},
          {"authorization", "Bearer test"}
        ],
        body: nil
      } ->
        {:ok, %Tesla.Env{status: 200, body: 52}}

      %Tesla.Env{
        method: :get,
        url: "https://plausible.io/api/v1/stats/timeseries",
        query: [
          period: "month",
          date: "2024-03-01",
          metrics: "visits",
          site_id: "test.lotta.schule"
        ],
        headers: [
          {_, _},
          {"authorization", "Bearer test"}
        ],
        body: nil
      } ->
        {:ok,
         %Tesla.Env{
           status: 200,
           body: %{
             "results" => [
               %{"date" => "2024-03-01", "visits" => 666},
               %{"date" => "2024-03-02", "visits" => 712},
               %{"date" => "2024-03-03", "visits" => 1110},
               %{"date" => "2024-03-04", "visits" => 1532},
               %{"date" => "2024-03-05", "visits" => 1746}
             ]
           }
         }}

      %Tesla.Env{
        method: :get,
        url: "https://plausible.io/api/v1/stats/aggregate",
        query: [
          period: "month",
          date: "2024-03-01",
          metrics: "visits,visitors,pageviews,bounce_rate,views_per_visit,visit_duration",
          site_id: "test.lotta.schule"
        ],
        headers: [
          {_, _},
          {"authorization", "Bearer test"}
        ],
        body: nil
      } ->
        {:ok,
         %Tesla.Env{
           status: 200,
           body: %{
             "results" => %{
               "bounce_rate" => %{"value" => 28},
               "pageviews" => %{"value" => 99_144},
               "views_per_visit" => %{"value" => 4.92},
               "visit_duration" => %{"value" => 255},
               "visitors" => %{"value" => 12_633},
               "visits" => %{"value" => 20_136}
             }
           }
         }}

      %Tesla.Env{
        method: :get,
        url: "https://plausible.io/api/v1/stats/breakdown",
        query: [
          period: "month",
          date: "2024-03-01",
          metrics: "visits,visitors",
          property: "visit:device",
          site_id: "test.lotta.schule"
        ],
        headers: [
          {_, _},
          {"authorization", "Bearer test"}
        ],
        body: nil
      } ->
        {:ok,
         %Tesla.Env{
           status: 200,
           body: %{
             "results" => [
               %{"device" => "mobile", "visits" => 28_123, "visitors" => 12_328},
               %{"device" => "tablet", "visits" => 234, "visitors" => 123},
               %{"device" => "desktop", "visits" => 1992, "visitors" => 299},
               %{"device" => "(not set)", "visits" => 255, "visitors" => 144}
             ]
           }
         }}

      %Tesla.Env{
        method: :post,
        url: "https://plausible.io/api/v1/sites/",
        body: "domain=test.lotta.schule&timezone=Europe%2FBerlin"
      } ->
        {:ok, %Tesla.Env{status: 201, body: %{}}}

      %Tesla.Env{
        method: :post,
        url: "https://plausible.io/api/v1/sites/",
        body: "domain=error.lotta.schule&timezone=Europe%2FBerlin"
      } ->
        {:ok, %Tesla.Env{status: 400, body: %{"error" => "Site already exists"}}}

      %Tesla.Env{
        method: :delete,
        url: "https://plausible.io/api/v1/sites/test.lotta.schule"
      } ->
        {:ok, %Tesla.Env{status: 200, body: %{}}}

      %Tesla.Env{
        method: :delete,
        url: "https://plausible.io/api/v1/sites/error.lotta.schule"
      } ->
        {:ok, %Tesla.Env{status: 404, body: %{"error" => "Site not found"}}}
    end)

    {:ok, tenant: tenant}
  end

  describe "analytics" do
    test "get_realtime_users returns realtime user count when analytics is enabled", %{
      tenant: tenant
    } do
      response = Analytics.get_realtime_users(tenant)

      assert {:ok, 52} = response
    end

    test "get_aggregation_metrics returns metrics", %{tenant: tenant} do
      period = "month"
      date = "2024-03-01"

      response = Analytics.get_aggregation_metrics(tenant, period, date)

      assert {:ok,
              %{
                bounce_rate: 28,
                pageviews: 99_144,
                views_per_visit: 4.92,
                visit_duration: 255,
                visitors: 12_633,
                visits: 20_136
              }} = response
    end

    test "get_timeseries_metrics returns metrics when analytics is enabled", %{tenant: tenant} do
      period = "month"
      date = "2024-03-01"
      metric = "visits"

      response = Analytics.get_timeseries_metrics(tenant, period, date, metric)

      assert {:ok,
              [
                %{
                  date: "2024-03-01",
                  value: 666
                },
                %{
                  date: "2024-03-02",
                  value: 712
                },
                %{
                  value: 1110
                },
                %{
                  date: "2024-03-04",
                  value: 1532
                },
                %{
                  date: "2024-03-05",
                  value: 1746
                }
              ]} = response
    end

    test "get_breakdown_metrics returns metrics when analytics is enabled", %{tenant: tenant} do
      period = "month"
      date = "2024-03-01"
      metrics = ["visits", :visitors]
      property = "visit_device"

      response = Analytics.get_breakdown_metrics(tenant, period, date, property, metrics)

      assert {:ok,
              [
                %{
                  property: "mobile",
                  metrics: [
                    %{metric: :visits, value: 28_123},
                    %{metric: :visitors, value: 12_328}
                  ]
                },
                %{
                  property: "tablet",
                  metrics: [
                    %{metric: :visits, value: 234},
                    %{metric: :visitors, value: 123}
                  ]
                },
                %{
                  property: "desktop",
                  metrics: [
                    %{metric: :visits, value: 1992},
                    %{metric: :visitors, value: 299}
                  ]
                },
                %{
                  property: "(not set)",
                  metrics: [
                    %{metric: :visits, value: 255},
                    %{metric: :visitors, value: 144}
                  ]
                }
              ]} = response
    end

    test "create_site creates a site successfully", %{tenant: tenant} do
      response = Analytics.create_site(tenant)

      assert :ok = response
    end

    test "create_site returns error when site creation fails", %{tenant: _tenant} do
      error_tenant = %{slug: "error"}

      response = Analytics.create_site(error_tenant)

      assert {:error, "Failed to create plausible site: (400)"} = response
    end

    test "delete_site deletes a site successfully", %{tenant: tenant} do
      response = Analytics.delete_site(tenant)

      assert :ok = response
    end

    test "delete_site returns error when site deletion fails", %{tenant: _tenant} do
      error_tenant = %{slug: "error"}

      response = Analytics.delete_site(error_tenant)

      assert {:error, "Failed to delete plausible site: (404)"} = response
    end

    test "returns error when analytics is not enabled" do
      default_config = Application.get_env(:lotta, :analytics)

      Application.put_env(:lotta, :analytics, endpoint: nil, api_key: nil)

      on_exit(fn ->
        Application.put_env(:lotta, :analytics, default_config)
      end)

      tenant = %{slug: "test"}

      assert {:error, "Analytics is not enabled"} = Analytics.get_realtime_users(tenant)

      assert {:error, "Analytics is not enabled"} =
               Analytics.get_aggregation_metrics(tenant, "month", "2024-03-01")

      assert {:error, "Analytics is not enabled"} =
               Analytics.get_timeseries_metrics(tenant, "month", "2024-03-01", "visits")

      assert {:error, "Analytics is not enabled"} =
               Analytics.get_breakdown_metrics(tenant, "month", "2024-03-01", "visit_device", [
                 "visits"
               ])

      assert {:error, "Analytics is not enabled"} = Analytics.create_site(tenant)
      assert {:error, "Analytics is not enabled"} = Analytics.delete_site(tenant)
    end
  end
end
