defmodule LottaWeb.AnalyticsResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Ecto.Query

  alias Lotta.{Tenants, Repo}
  alias Lotta.Accounts.User
  alias LottaWeb.Auth.AccessToken

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    user =
      from(u in User, where: u.email == ^"eike.wiewiorra@lotta.schule")
      |> Repo.one!(prefix: tenant.prefix)

    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)

    {:ok,
     %{
       user_jwt: user_jwt
     }}
  end

  describe "realtime query" do
    @query """
      query GetTenantRealtimeAnalytics {
        currentUserCount: realtimeAnalytics
      }
    """

    test "it should return an error when user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{"currentUserCount" => nil},
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["currentUserCount"]
                 }
               ]
             } = res
    end

    test "returns error if user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "currentUserCount" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["currentUserCount"]
                 }
               ]
             } = res
    end
  end

  describe "aggregate query" do
    @query """
      query GetTenantAggregateAnalytics($date: Date!) {
        analytics: aggregateAnalytics(date: $date, period: "month") {
          visits
          visitors
          pageviews
          bounceRate
          visitDuration
          viewsPerVisit
        }
      }
    """

    test "it should return an error when user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query, variables: %{date: "2021-01-01"})
        |> json_response(200)

      assert %{
               "data" => %{},
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["analytics"]
                 }
               ]
             } = res
    end

    test "returns error if user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{date: "2021-01-01"})
        |> json_response(200)

      assert %{
               "data" => %{},
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["analytics"]
                 }
               ]
             } = res
    end
  end

  describe "timeseries query" do
    @query """
      query GetTenantTimeseriesAnalytics($date: Date!, $metric: AnalyticsMetric!) {
        metrics: timeseriesAnalytics(date: $date, metric: $metric, period: "month") {
          date
          value
        }
      }
    """

    test "it should return an error when user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query, variables: %{date: "2021-01-01", metric: "VISITS"})
        |> json_response(200)

      assert %{
               "data" => %{"metrics" => nil},
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["metrics"]
                 }
               ]
             } = res
    end

    test "returns error if user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{date: "2021-01-01", metric: "VISITS"})
        |> json_response(200)

      assert %{
               "data" => %{
                 "metrics" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["metrics"]
                 }
               ]
             } = res
    end
  end
end
