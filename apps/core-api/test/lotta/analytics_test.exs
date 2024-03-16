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
  end
end
