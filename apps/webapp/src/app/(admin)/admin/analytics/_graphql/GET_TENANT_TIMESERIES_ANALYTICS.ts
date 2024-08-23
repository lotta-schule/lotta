import { graphql } from 'api/graphql';

export const GET_TENANT_TIMESERIES_ANALYTICS = graphql(`
  query GetTenantTimeseriesAnalytics(
    $date: Date!
    $metric: AnalyticsMetric!
    $period: AnalyticsPeriod!
  ) {
    metrics: timeseriesAnalytics(
      date: $date
      metric: $metric
      period: $period
    ) {
      date
      value
    }
  }
`);
