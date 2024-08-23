import { graphql } from 'api/graphql';

export const GET_TENANT_AGGREGATE_ANALYTICS = graphql(`
  query GetTenantAggregateAnalytics($date: Date!, $period: AnalyticsPeriod!) {
    analytics: aggregateAnalytics(date: $date, period: $period) {
      visits
      visitors
      pageviews
      bounceRate
      visitDuration
      viewsPerVisit
    }
  }
`);
