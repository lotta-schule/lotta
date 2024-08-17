import { graphql } from 'api/graphql';

export const GET_TENANT_BREAKDOWN_ANALYTICS = graphql(`
  query GetTenantBreakdownAnalytics(
    $date: Date!
    $property: AnalyticsProperty!
    $metrics: [AnalyticsMetric!]!
    $period: AnalyticsPeriod!
  ) {
    properties: breakdownAnalytics(
      date: $date
      period: $period
      property: $property
      metrics: $metrics
    ) {
      property
      metrics {
        metric
        value
      }
    }
  }
`);
