export type MetricType =
  | 'visits'
  | 'visitors'
  | 'pageviews'
  | 'bounceRate'
  | 'visitDuration'
  | 'viewsPerVisit';

export type GQLCompatibleMetricType<T extends MetricType = MetricType> =
  Uppercase<T>;

export const gqlCompatibleMetricType = <T extends MetricType>(metric: T) =>
  metric.replace(/([A-Z])/g, '_$1').toUpperCase() as GQLCompatibleMetricType<T>;
